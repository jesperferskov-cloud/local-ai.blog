---
id: featured-1
title: "Frigør Kraften i Lokal AI: Din Guide til On-Device AI på Apple-Enheder"
slug: frigoer-kraften-i-lokal-ai-apple-enheder
status: published
category: mac
hardwareArch: apple-m
hardwareLabel: "Apple Silicon M3 / M4"
hardware: "M3 Max • 128GB"
date: "2025-03-01"
readingTime: "8 min"
tags:
  - Apple Silicon
  - Unified Memory
  - Metal GPU
  - Ollama
  - MLX
metrics:
  primaryValue: "48.2 tok/s"
  primaryLabel: "Gns. Inferenshastighed"
  secondaryValue: "41.8 GB / 120 GB"
  secondaryLabel: "RAM Allokering"
updatedAt: "2025-03-01T10:00:00.000Z"
wordCount: 820
readTime: "8 min"
---

# Frigør Kraften i Lokal AI: Din Guide til On-Device AI på Apple-Enheder

Apples **Unified Memory Architecture (UMA)** har revolutioneret on-device AI. I stedet for separate VRAM-buffere som på traditionelle GPU’er, deler CPU og Metal GPU op til 128GB eller 192GB båndbredde med op til 800 GB/s. Dette gør det muligt at køre modeller som Llama 3.3 70B, DeepSeek V3/R1 og Qwen 2.5 helt lokalt på dit skrivebord.

---

## 1. Hvorfor Unified Memory er en game-changer

Traditionelle PC-opsætninger kræver specialiserede GPU’er som NVIDIA RTX 4090 med 24 GB VRAM eller dyr server-hardware som H100 til store modeller. Når en 70B model i 4-bit kvantisering fylder 40+ GB, kan en forbruger-PC simpelthen ikke have den i grafikkortets hukommelse uden ekstremt langsom RAM-offloading.

På en Mac med M3 Max eller M4 Max har hele maskinen adgang til den samlede hukommelse. En 128GB Mac kan afsætte 96-105 GB direkte til Metal GPU-computations via et simpelt sysctl-flag:

```bash
sudo sysctl iogpu.wired_mem_limit=102400
```

---

## 2. Den ideelle software-stak: Ollama og MLX

For hverdagsbrugere er Ollama den mest intuitive platform:

```bash
brew install ollama
ollama run llama3.3:70b-instruct-q4_K_M
```

For maksimal udnyttelse af Apples hardware er Apples eget MLX-framework uovertruffet. MLX er bygget fra bunden til Swift og Python og udnytter Apples Neural Engine (ANE) og Metal Performance Shaders til at opnå op mod 15-20% højere token-rate.

---

## 3. Kvantisering: Sweet spot mellem præcision og hastighed

| Specifikation | FP16 Vægte | Q4_K_M (Anbefalet) |
|---|---|---|
| Model Størrelse | 141.2 GB | **41.8 GB** |
| M3 Max Tok/s | 14.1 tok/s | **48.2 tok/s** |
| TTFT Latens | 420 ms | **180 ms** |
| Nødvendig RAM | > 160 GB | **64-128 GB** |
