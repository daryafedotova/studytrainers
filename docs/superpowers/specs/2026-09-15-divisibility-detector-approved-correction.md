# Divisibility Detector — approved correction

This note overrides the corresponding example in both:

- `docs/superpowers/specs/2026-09-14-divisibility-detector-trainer-design.md`
- `docs/superpowers/plans/2026-09-14-divisibility-detector-implementation-plan.md`

The invalid grade-5 fraction-reduction example is **150/216 ÷ 10**, not **150/210 ÷ 10**.

Reason: `150` and `210` are both divisible by `10`, so reducing `150/210` by `10` is mathematically valid. In `150/216`, only the numerator is divisible by `10`, so the proposed reduction correctly serves as an error-finding task.

The user approved this correction on 2026-09-15. The implementation and automated tests use `150/216`.
