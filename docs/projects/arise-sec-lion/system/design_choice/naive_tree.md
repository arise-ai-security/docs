---
title: Navie Agentic Tree System Design
sidebar_position: 2
---

import NaiveTree from '@site/src/components/naive_tree';

# Design Choice 1: Recursive Planning and Working With No Constraints
This page analyzes the direct approach to implement the tree-structure without additional restraints. Agents decide to become worker agent nodes or spawn more subordinate agent nodes all at the internal LLM's discretion.

## Naive Tree-Structured Agentic System 
This system is not incorporating any extra features such as budget management, task assignment mechanism, or reward allocation mechanism. Each agent node simply spawns subordinate nodes to tackle sub-tasks without any constraints or monitoring.

## Interactive Diagram

Below is an interactive React Flow diagram that visualizes the high-level structure. You can pan, zoom, and explore relationships between agents. Click on the nodes to see their details.
<NaiveTree/>


