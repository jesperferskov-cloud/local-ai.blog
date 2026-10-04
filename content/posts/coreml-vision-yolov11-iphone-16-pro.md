---
id: art-2
title: "CoreML Vision & YOLOv11 på iPhone 16 Pro: 60 FPS Realtids-inferens"
slug: coreml-vision-yolov11-iphone-16-pro
status: published
category: iphone
hardwareArch: iphone-a
hardwareLabel: "A18 Pro · 16-Core ANE"
hardware: "A18 Pro • 16-Core ANE"
date: "2025-02-18"
readingTime: "5 min"
primaryTag: "iPhone AI"
coverImage: ""
tags:
  - iPhone 16 Pro
  - CoreML
  - YOLOv11
  - Vision
  - iPhone AI
  - iOS
metrics:
  primaryValue: "8.4 ms"
  primaryLabel: "ANE Latens pr. Billede"
  secondaryValue: "1.6 W"
  secondaryLabel: "Strømforbrug"
updatedAt: "2025-02-18T09:15:00.000Z"
wordCount: 460
readTime: "5 min"
---

# CoreML Vision & YOLOv11 på iPhone 16 Pro: 60 FPS Realtids-inferens

Med A18 Pro og CoreML Tools 8.0 kan man køre avancerede objektdetektionsmodeller direkte i kamerastreamen på iOS uden at dræne batteriet eller overophede enheden.

---

## 1. Kvantisering til MIL (Model Intermediate Language)

Ved at konvertere PyTorch-vægtene via CoreML Tools med INT8 per-channel kvantisering opnås 100% kørsel på Neural Engine i stedet for den batterikrævende GPU:

```bash
python -m coremltools.converters.mil.convert yolov11n.pt --target ios18
```
