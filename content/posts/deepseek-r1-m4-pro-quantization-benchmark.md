---
id: art-1
title: "DeepSeek R1 på M4 Pro: 32B vs 14B Kvantisering & Tokens/sekund"
slug: deepseek-r1-m4-pro-quantization-benchmark
status: published
category: benchmarks
hardwareArch: apple-m
hardwareLabel: "M4 Pro · 48GB RAM"
hardware: "M4 Pro • 48GB"
date: "2025-02-24"
readingTime: "6 min"
updated: "2025-03-02"
primaryTag: "Benchmarks"
coverImage: ""
tags:
  - DeepSeek
  - M4 Pro
  - Kvantisering
  - Benchmarks
metrics:
  primaryValue: "38.4 tok/s"
  primaryLabel: "14B Q8 Hastighed"
  secondaryValue: "19.2 tok/s"
  secondaryLabel: "32B Q4 Hastighed"
updatedAt: "2025-02-24T14:30:00.000Z"
wordCount: 540
readTime: "6 min"
---

# DeepSeek R1 på M4 Pro: 32B vs 14B Kvantisering & Tokens/sekund

DeepSeek R1 har sat nye standarder for matematiske og logiske ræsonnementer. På en MacBook Pro med M4 Pro og 48 GB Unified Memory testede vi både 14B og 32B varianterne i Ollama og llama.cpp.

---

## 1. Ydeevne og Hukommelsesforbrug

14B-modellen med Q8_0 kvantisering kørte med imponerende 38.4 tokens i sekundet, hvilket gør den hurtigere end menneskelig læsehastighed og velegnet til interaktivt arbejde.

32B-modellen med Q4_K_M rammer 19.2 tokens i sekundet med et hukommelsesforbrug på ca. 20.8 GB, hvilket efterlader masser af plads til Xcode, Docker og browser.

```bash
ollama run deepseek-r1:14b-q8_0
```
