---
title: Tree-Strucuted Agentic System Reward Allocation Mechanism
sidebar_position: 1
---

# Agentic Tree Overview
This overview is largely adapted from [the brainstorming notes and design documents](/docs/weekly/brainstorming/agentic-tree.md).

## Introduction
Our proposed tree-structured system is highly recursive, and actions taken by agent nodes are dependent on the current budget. Every single node is a subclass of a superclass of an abstract AgentNode. This tree system allows multiple models to collaborate, compare and select the best actions to finish a given task, and even backtrack the to redo the failed objective if needed.