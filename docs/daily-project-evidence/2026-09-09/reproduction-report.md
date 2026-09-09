# Independent Chance Drawer reproduction

Built solely from step-1.txt and step-2.txt in this directory; no original Site implementation, screenshots, hosting tools, or Site files accessed. Parent supplied a later focus-behavior clarification, applied without code reference.

Actual Chromium verification: 14 groups pass, 0 fail. Independent combinatorics cross-check covers 8,590 valid count/draw/replacement configurations, 55,340 outcome probabilities and 166,020 event/target comparisons; max absolute error 3.33e-16. Balanced [16.6666667,50,30,3.3333333]%, rare 30%, replacement 28.8%, alternate 2A/4B/3 draw [20,60,20,0]% pass.

Also checked atomic validation including 12 invalid-input cases; committed-state/report isolation; Clear pending-text preservation; preset/reset changes; deterministic all-A/all-B/depletion and 303 random calls for 101 actual draws; exact newest-eight history; signed rates and rounded negative zero; 10,000 cap and focus transfer/re-enabling; report selection, native clipboard return and injected success/denial/error branches; opaque iframe readiness origin null and storage denial; no external requests/script errors; 320/375/768/1024/1440/1600 widths, 200% root text at 320, keyboard controls and touch emulation.

Repairs: distribution grid had an extra closing parenthesis; fixed after computed-CSS inspection, strengthened chart layout assertion. Added explicit grayscale accent color. Added clarified focus transfer to Clear when draw buttons become disabled. Expanded test host iframe during initial/sample screenshots to capture complete document. Reran the full suite after repairs.

Limits: Chromium only; no cross-browser, physical-device, independent-human or identical-pixel claim. Clipboard API branch success is injected; native copy reports actual execCommand return (Copied in this Chromium run), without clipboard readback. Nonfinite number-input content is browser-sanitized to blank before validation. Text scale screenshot captures the first viewport, with programmatic whole-document overflow assertions.

Artifacts: chance-drawer.html; verify.cjs; evidence.json; initial.png; sampled.png; text-scale-320.png.
Run finished: 2026-09-09T16:09:48.587Z. Port 5181 server stopped: True.
