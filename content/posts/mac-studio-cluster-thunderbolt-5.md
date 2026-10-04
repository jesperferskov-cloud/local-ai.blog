---
id: art-3
title: "Mac Studio Klynge: Distribueret LLM Kørsel over Thunderbolt 5"
slug: mac-studio-cluster-thunderbolt-5
status: published
category: hybrid
hardwareArch: hybrid
hardwareLabel: "2x M2 Ultra · 384GB UMA"
hardware: "2x M2 Ultra • 384GB UMA"
date: "2025-01-20"
readingTime: "10 min"
primaryTag: "Hybrid Apps"
tags:
  - Hybrid Apps
  - Systemdesign
  - Mac Studio
  - Thunderbolt 5
metrics:
  primaryValue: "12.4 tok/s"
  primaryLabel: "405B Model Hastighed"
  secondaryValue: "80 Gbps"
  secondaryLabel: "Interconnect Båndbredde"
updatedAt: "2025-01-20T10:00:00.000Z"
wordCount: 490
readTime: "10 min"
coverImage: ""
---

# Mac Studio Klynge: Distribueret LLM Kørsel over Thunderbolt 5

Hvorfor bruge 250.000 kr. på en enkelt server, når to Mac Studios med M2 Ultra kan forbindes i en tensor-parallel eller pipeline-parallel klynge via Exo eller llama.cpp RPC?

---

## 1. Opsætning med Exo Distributed Inference

Exo opdager automatisk enheder på det lokale netværk og fordeler lagene i modellen proportionalt med maskinernes ledige hukommelse.

```bash
pip install exo && exo run llama-3.3-70b --node-type worker
```
