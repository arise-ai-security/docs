---
slug: /projects/arise-sec-lion/system/design_choice/
title: Tree-Strucuted Agentic Design Choices Overview
sidebar_position: 1
hide_title: true
---

# Design Choices Overview
This overview covers all variants of the tree-structured agentic systems. 

## 📚 Documentations

### Design Choice 1: Naive Tree-Structured Agentic System
- **[Naive Tree](./naive_tree.md)** -  We analyzer the direct approach to implement the tree-structure without additional restraints. This design enables agents with full autonomy to decide whether to become worker agent nodes or spawn more subordinate agent nodes at their internal LLM's discretion.

### Design Choice 2: Budgeted Tree-Structured Agentic System
- **[Budgeted Tree](./budgeted_tree.md)** - This design builds upon the naive tree-structured agentic system by introducing budget management. This strategy limits the growth of the agent tree and aims to enhance the overall focus to achive better performance. However, the budget management is not yet complemented with reward allocation mechanisms to fine-tune agent behaviors.