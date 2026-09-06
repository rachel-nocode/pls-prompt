import { copyText } from "../lib/copy-text.ts";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { recipeSchema, emptyRecipe, publicationProblems } from "../lib/recipe-types.ts";
import { recipeDownload } from "../lib/recipe-export.ts";
import { readFileSync, readdirSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import test from "node:test";
import { createRepository } from "../lib/repository.ts";
import { seedGallery } from "../lib/seed-gallery.ts";
import { seedDailyProjects } from "../lib/seed-daily-projects.ts";
import { recordRecipeDownload, downloadReport } from "../lib/download-analytics.ts";
import { seedDatabase } from "../lib/seed-database.ts";
import { promptExercises } from "../lib/prompt-exercises.ts";

const member = { id: "learner-one", displayName: "Learner", isCreator: false };
const other = { id: "learner-two", displayName: "Another learner", isCreator: false };
const creator = { id: "creator", displayName: "Creator", isCreator: true };
const input = { title: "My build", promptText: "Build a useful app.", notes: "Try next week", tags: ["app", "ideas"] };
const fails = (promise, status) => assert.rejects(promise, error => error.status === status);

function database() {
  const sqlite = new DatabaseSync(":memory:");
  sqlite.exec("PRAGMA foreign_keys=ON");
  const db = {
    failBatchAt: -1,
    beforeBatch: null,
    prepare(sql) {
      let values = [];
      return {
        bind(...args) { values = args; return this; },
        async first() { return sqlite.prepare(sql).get(...values) ?? null; },
        async all() { return { results: sqlite.prepare(sql).all(...values) }; },
        async run() { return { meta: { changes: Number(sqlite.prepare(sql).run(...values).changes) } }; },
      };
    },
    async batch(statements) {
      this.beforeBatch?.(); this.beforeBatch = null;
      sqlite.exec("BEGIN IMMEDIATE");
      try {
        const results = [];
        for (const [index, statement] of statements.entries()) {
          if (index === this.failBatchAt) { this.failBatchAt = -1; throw new Error("Simulated storage failure"); }
          results.push(await statement.run());
        }
        sqlite.exec("COMMIT");
        return results;
      } catch (error) { sqlite.exec("ROLLBACK"); throw error; }
    },
  };
  const migrations = readdirSync(new URL("../drizzle/", import.meta.url)).filter(file => file.endsWith(".sql")).sort();
  const migrate = (files = migrations) => files.forEach(file => sqlite.exec(readFileSync(new URL("../drizzle/" + file, import.meta.url), "utf8")));
  return { sqlite, db, migrate, migrations };
}
async function setup(t) {
  const context = database(); t.after(() => context.sqlite.close()); context.migrate();
  await seedDatabase(context.db);
  return { ...context, store: createRepository(context.db) };
}
const lesson = async (store, index = 0) => (await store.publicLessons())[index];
const pass = async (store, actor = member, index = 0) => {
  const current = await lesson(store, index);
  return store.completeLesson(actor, current.slug, promptExercises[current.id].referenceAnswer, current.version);
};


function completeRecipe(overrides = {}) {
  return {...emptyRecipe(), title:"Test project",summary:"A real project",category:"Web app",steps:[{title:"Build",text:"Build the full app."}],tool:"Codex",setup:"Start in an empty folder.",customize:"Change colors and sample data.",limits:"Session only.",demo:{url:"/demos/test",build:"build-1",images:["/previews/test.png"],reviewed:true},proof:{builtAt:"2026-09-05",model:"",startingPoint:"Empty directory",interventions:"One build",checks:"Create, edit and reset",reproduction:"passed",reproductionNotes:"Clean independent build passed."},...overrides};
}
const skill = () => completeRecipe({format:"skill",steps:[],files:[{name:"SKILL.md",content:"---\nname: test-project\ndescription: Build the project.\n---\nRead references/guide.md and build it."},{name:"references/guide.md",content:"Build a complete interactive project. Unicode: café."}]});
const createPublished = async store => store.editRecipe(creator,null,0,completeRecipe(),true,true);

test("recipe publication is creator-only and incomplete drafts cannot leak",async t=>{
 const {store}=await setup(t);
 await fails(store.editRecipe(member,null,0,completeRecipe(),true,true),403);
 const id=await store.editRecipe(creator,null,0,{...emptyRecipe(),title:"Private draft"},false,true);
 assert.equal(await store.publishedRecipe(id),null);assert.equal((await store.gallery()).length,0);
 await fails(store.editRecipe(creator,id,1,{...emptyRecipe(),title:"Private draft"},true,true),400);
 assert.equal(await store.canReadRecipeMedia("/demos/test"),false);
});
test("publish failure and competing revision preserve the released snapshot",async t=>{
 const {store,db,sqlite}=await setup(t); const id=await createPublished(store);const old=await store.publishedRecipe(id);
 const next=completeRecipe({title:"New title"});db.failBatchAt=1;
 await assert.rejects(store.editRecipe(creator,id,1,next,true,true),/Simulated/);
 assert.equal((await store.publishedRecipe(id)).id,old.id);
 assert.equal(sqlite.prepare("SELECT count(*) n FROM recipe_versions WHERE prompt_id=?").get(id).n,1);
 db.beforeBatch=()=>sqlite.prepare("UPDATE recipe_projects SET revision=revision+1 WHERE prompt_id=?").run(id);
 await fails(store.editRecipe(creator,id,1,next,true,true),409);
 assert.equal((await store.publishedRecipe(id)).id,old.id);
});
test("saved packs retain order, old version, and private edits after publication",async t=>{
 const {store}=await setup(t);const original=completeRecipe({format:"pack",steps:[{title:"First",text:"Build it."},{title:"Second",text:"Check keyboard controls."}]});
 const id=await store.editRecipe(creator,null,0,original,true,true);const released=await store.publishedRecipe(id);const saved=await store.savePrompt(member,id,released.id);
 assert.deepEqual(JSON.parse(saved.recipe_snapshot).steps,original.steps);assert.equal(saved.source_recipe_version,released.id);
 const changed={...original,title:"Private variant",steps:[...original.steps,{title:"Third",text:"My private customization"}]};
 await store.updateItem(member,saved.id,1,{...input,title:changed.title,recipe:changed});
 const revision={...original,title:"Published rename"};await store.editRecipe(creator,id,1,revision,true,true);
 const again=await store.savePrompt(member,id);assert.equal(again.version,2);assert.equal(JSON.parse(again.recipe_snapshot).steps.length,3);
 assert.deepEqual((await store.publishedRecipe(id,released.id)).recipe,original);
 assert.equal((await store.library(other)).items.length,0);await fails(store.itemVersions(other,saved.id),404);
 await fails(store.savePrompt(member,id,"not-a-version"),409);
});
test("changed build instructions require a new demo and reproduction record",async t=>{
 const {store}=await setup(t);const id=await createPublished(store);
 const changed=completeRecipe({steps:[{title:"Build",text:"Different behavior"}]});
 await fails(store.editRecipe(creator,id,1,changed,true,true),400);
 await store.editRecipe(creator,id,1,{...changed,demo:{...changed.demo,build:"build-2"},proof:{...changed.proof,reproductionNotes:"Second clean rebuild tested different behavior."}},true,true);
 assert.equal((await store.publishedRecipe(id)).recipe.demo.build,"build-2");
});
test("structured personal creation and restoring text or skill preserve exact content",async t=>{
 const {store}=await setup(t);const structured=await store.createItem(member,{...input,recipe:skill()});
 assert.equal(JSON.parse(structured.recipe_snapshot).files[0].name,"SKILL.md");
 const plain=await store.createItem(member,input);await store.updateItem(member,plain.id,1,{...input,recipe:skill()});
 const restored=await store.restoreItem(member,plain.id,1,2);assert.equal(restored.recipe_snapshot,null);assert.equal(restored.prompt_text,input.promptText);
 const again=await store.restoreItem(member,plain.id,2,3);assert.equal(JSON.parse(again.recipe_snapshot).files[1].name,"references/guide.md");
});
test("lesson archive rewards preserve structured recipe and immutable source version",async t=>{
 const {store,sqlite}=await setup(t);const id=await store.editRecipe(creator,null,0,skill(),true,true);const version=await store.publishedRecipe(id);
 const current=await lesson(store);sqlite.prepare("UPDATE lessons SET reward_prompt_id=? WHERE id=?").run(id,current.id);
 const result=await pass(store);assert.equal(result.item.source_recipe_version,version.id);assert.equal(JSON.parse(result.item.recipe_snapshot).files[0].name,"SKILL.md");
 const repeated=await pass(store);assert.equal(repeated.item.id,result.item.id);
});
test("skill export is an independently readable ZIP preserving paths and Unicode",()=>{
 const recipe=skill();const download=recipeDownload(recipe,"version-1","A skill");assert.equal(download.filename,"A-skill.zip");
 const check=spawnSync("python3",["-c",`import sys,io,zipfile,json
z=zipfile.ZipFile(io.BytesIO(sys.stdin.buffer.read()))
assert z.testzip() is None
print(json.dumps({n:z.read(n).decode('utf-8') for n in z.namelist()}))`],{input:download.bytes,encoding:"utf8"});
 assert.equal(check.status,0,check.stderr);const unpacked=JSON.parse(check.stdout);
 for(const file of recipe.files)assert.equal(unpacked[file.name],file.content);
 assert.equal(Object.keys(unpacked).length,recipe.files.length+1);assert.ok(unpacked["PLS-RECIPE.md"].includes("version-1"));
 assert.throws(()=>recipeDownload({...recipe,files:[{name:"../private.env",content:"secret"}]},"1","bad"));
 assert.equal(recipeSchema.safeParse({...recipe,files:[{name:"SKILL.md",content:"a"},{name:"skill.md",content:"b"}]}).success,false);
 const pack=completeRecipe({format:"pack",steps:[{title:"Alpha",text:"FIRST"},{title:"Beta",text:"SECOND"}]});
 const text=new TextDecoder().decode(recipeDownload(pack,"release-9","pack").bytes);assert.ok(text.indexOf("FIRST")<text.indexOf("SECOND"));assert.ok(text.includes("release-9"));assert.ok(text.includes(pack.setup));
 assert.deepEqual(publicationProblems(recipe),[]);
});

test("gallery seeding is additive, preserves legacy grants and ignores later creator changes",async t=>{
 const {store,db,sqlite}=await setup(t); const earned=await pass(store); const before=sqlite.prepare("SELECT * FROM prompts ORDER BY id").all();
 await seedGallery(db);assert.equal((await store.gallery()).length,5);
 for(const row of before)assert.deepEqual(sqlite.prepare("SELECT * FROM prompts WHERE id=?").get(row.id),row);
 const saved=await store.libraryItemForPrompt(member,earned.item.prompt_id);assert.equal(saved.id,earned.item.id);
 const id="gallery-tempo-lab";const original=await store.publishedRecipe(id);const edited={...original.recipe,title:"Creator's changed title"};
 await store.editRecipe(creator,id,1,edited,true,true);await seedGallery(db);
 assert.equal((await store.publishedRecipe(id)).recipe.title,edited.title);assert.equal((await store.gallery()).length,5);
});

test("denied clipboard falls back, reports failure honestly, and restores focus",async()=>{
 const oldNavigator=Object.getOwnPropertyDescriptor(globalThis,"navigator"),oldDocument=Object.getOwnPropertyDescriptor(globalThis,"document");
 let removed=0,focused=0,allowed=false;
 Object.defineProperty(globalThis,"navigator",{configurable:true,value:{clipboard:{writeText:async()=>{throw new Error("Permission denied");}}}});
 Object.defineProperty(globalThis,"document",{configurable:true,value:{activeElement:{focus:()=>focused++},createElement:()=>({value:"",style:{},setAttribute(){},select(){},remove(){removed++;}}),body:{appendChild(){}},execCommand:()=>allowed}});
 try {await assert.rejects(copyText("private recipe"),/Copy is unavailable/);assert.equal(removed,1);assert.equal(focused,1);allowed=true;await copyText("private recipe");assert.equal(removed,2);assert.equal(focused,2);}
 finally {if(oldNavigator)Object.defineProperty(globalThis,"navigator",oldNavigator);else delete globalThis.navigator;if(oldDocument)Object.defineProperty(globalThis,"document",oldDocument);else delete globalThis.document;}
});

test("daily addition preserves all existing rows and private copies; repeat seed preserves creator edits and analytics",async t=>{
 const {store,db,sqlite}=await setup(t);await seedGallery(db);
 const saved=await store.savePrompt(member,"gallery-tempo-lab");
 const tables=["prompts","recipe_versions","recipe_projects","library_items","library_versions","prompt_access"];
 const before=Object.fromEntries(tables.map(table=>[table,sqlite.prepare(`SELECT * FROM ${table} ORDER BY rowid`).all()]));
 await seedDailyProjects(db);assert.equal((await store.gallery()).length,6);
 for(const table of tables){const after=sqlite.prepare(`SELECT * FROM ${table} ORDER BY rowid`).all();for(const row of before[table])assert.ok(after.some(x=>JSON.stringify(x)===JSON.stringify(row)),table);}
 assert.equal((await store.libraryItemForPrompt(member,"gallery-tempo-lab")).id,saved.id);
 const original=await store.publishedRecipe("daily-light-relay");assert.equal(original.id,"daily-light-relay-v1");assert.deepEqual(publicationProblems(original.recipe),[]);
 const download=recipeDownload(original.recipe,original.id,"light-relay");const text=new TextDecoder().decode(download.bytes);
 assert.equal(download.filename,"light-relay.md");assert.ok(text.indexOf('1. Build Light Relay')<text.indexOf('2. Verify and repair'));assert.ok(text.includes(original.recipe.setup));assert.ok(text.includes(original.recipe.limits));assert.ok(!text.includes('<!doctype html>'));
 await recordRecipeDownload(db,"daily-light-relay",original.id);assert.equal((await downloadReport(db)).find(r=>r.slug==="light-relay").downloads,1);
 await store.editRecipe(creator,"daily-light-relay",1,{...original.recipe,title:"Creator's revised Light Relay"},true,true);
 await seedDailyProjects(db);assert.equal((await store.gallery()).length,6);assert.equal((await store.publishedRecipe("daily-light-relay")).recipe.title,"Creator's revised Light Relay");
 assert.equal((await downloadReport(db)).find(r=>r.slug==="light-relay").downloads,1);
});

test("daily seed transaction rolls back failures and tolerates concurrent completed seed",async t=>{
 const {store,db,sqlite}=await setup(t);await seedGallery(db);db.failBatchAt=1;
 await assert.rejects(seedDailyProjects(db),/Simulated/);assert.equal(await store.publishedRecipe("daily-light-relay"),null);
 assert.equal(sqlite.prepare("SELECT count(*) n FROM content_revisions WHERE id LIKE 'daily-project-%'").get().n,0);
 await seedDailyProjects(db);const marker=sqlite.prepare("SELECT * FROM content_revisions WHERE id LIKE 'daily-project-%'").get();
 sqlite.prepare("DELETE FROM content_revisions WHERE id=?").run(marker.id);
 db.beforeBatch=()=>sqlite.prepare("INSERT INTO content_revisions(id,applied_at) VALUES (?,?)").run(marker.id,marker.applied_at);
 await seedDailyProjects(db);assert.equal((await store.gallery()).length,6);
});
