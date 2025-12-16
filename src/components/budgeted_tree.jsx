import React, { useCallback, useState } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
} from 'reactflow';
import 'reactflow/dist/style.css';

// Color legend:
// BOSS: purple (#7c3aed)
// MANAGER: blue (#2563eb)
// WORKER: green (#16a34a)
// PENDING: yellow (#eab308)

const ROLE_COLORS = {
  boss: '#7c3aed',
  manager: '#2563eb',
  worker: '#16a34a',
  pending: '#eab308',
};

const STATUS_BADGES = {
  pending: { bg: '#fef3c7', text: '#92400e' },
  analyzing: { bg: '#dbeafe', text: '#1e40af' },
  in_progress: { bg: '#d1fae5', text: '#065f46' },
  waiting: { bg: '#e0e7ff', text: '#3730a3' },
  completed: { bg: '#d1fae5', text: '#065f46' },
  failed: { bg: '#fee2e2', text: '#991b1b' },
  blocked: { bg: '#fecaca', text: '#991b1b' },
  terminated: { bg: '#e5e7eb', text: '#374151' },
  verifying: { bg: '#fae8ff', text: '#86198f' },
};

const COMPLEXITY_COLORS = {
  simple: { bg: '#d1fae5', text: '#065f46' },
  complex: { bg: '#fee2e2', text: '#991b1b' },
};

// Section component for the modal
function Section({ title, children }) {
  if (!children) return null;
  return (
    <div style={{ marginBottom: '20px' }}>
      <h3 style={{ fontSize: '13px', fontWeight: '600', color: '#6b7280', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {title}
      </h3>
      {children}
    </div>
  );
}

// Modal component for agent details
function AgentModal({ agent, onClose }) {
  if (!agent) return null;

  const roleColor = ROLE_COLORS[agent.role] || '#6b7280';
  const statusStyle = STATUS_BADGES[agent.status] || { bg: '#e5e7eb', text: '#374151' };
  const complexityStyle = agent.complexity ? (COMPLEXITY_COLORS[agent.complexity] || { bg: '#e5e7eb', text: '#374151' }) : null;

  const hasConfig = agent.configStrategy || agent.workerTool || (agent.configDetails && Object.keys(agent.configDetails).length > 0);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          maxWidth: '650px',
          width: '90%',
          maxHeight: '85vh',
          overflow: 'auto',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <span
              style={{
                backgroundColor: roleColor,
                color: 'white',
                padding: '4px 12px',
                borderRadius: '9999px',
                fontSize: '13px',
                fontWeight: '600',
                textTransform: 'uppercase',
              }}
            >
              {agent.role}
            </span>
            <span
              style={{
                backgroundColor: statusStyle.bg,
                color: statusStyle.text,
                padding: '4px 12px',
                borderRadius: '9999px',
                fontSize: '13px',
                fontWeight: '500',
              }}
            >
              {agent.status}
            </span>
            {complexityStyle && (
              <span
                style={{
                  backgroundColor: complexityStyle.bg,
                  color: complexityStyle.text,
                  padding: '4px 12px',
                  borderRadius: '9999px',
                  fontSize: '13px',
                  fontWeight: '500',
                }}
              >
                {agent.complexity}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#6b7280',
              padding: '0',
              lineHeight: '1',
            }}
          >
            &times;
          </button>
        </div>

        {/* Objective */}
        <Section title="Objective">
          <p style={{ fontSize: '15px', color: '#1f2937', lineHeight: '1.6', margin: 0 }}>
            {agent.taskDescription}
          </p>
        </Section>

        {/* Complexity Evaluation */}
        {agent.complexityReasoning && (
          <Section title="Complexity Evaluation">
            <div style={{ backgroundColor: '#f9fafb', borderRadius: '8px', padding: '12px' }}>
              <p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.6', margin: 0 }}>
                {agent.complexityReasoning}
              </p>
            </div>
          </Section>
        )}

        {/* Configuration */}
        {hasConfig && (
          <Section title="Configuration">
            <div style={{ backgroundColor: '#f9fafb', borderRadius: '8px', padding: '12px' }}>
              {agent.configStrategy && (
                <div style={{ marginBottom: agent.workerTool || Object.keys(agent.configDetails || {}).length > 0 ? '12px' : 0 }}>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Strategy</div>
                  <div style={{ fontSize: '14px', color: '#1f2937' }}>{agent.configStrategy}</div>
                </div>
              )}
              {agent.workerTool && (
                <div style={{ marginBottom: Object.keys(agent.configDetails || {}).length > 0 ? '12px' : 0 }}>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Worker Tool</div>
                  <div style={{ fontSize: '14px', color: '#1f2937', fontFamily: 'monospace' }}>{agent.workerTool}</div>
                </div>
              )}
              {agent.configDetails && Object.keys(agent.configDetails).length > 0 && (
                <div>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Details</div>
                  <pre style={{ fontSize: '12px', color: '#1f2937', margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                    {JSON.stringify(agent.configDetails, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </Section>
        )}

        {/* Subtasks (for managers) */}
        {agent.subtasks && agent.subtasks.length > 0 && (
          <Section title="Subtasks">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {agent.subtasks.map((subtask, index) => (
                <div
                  key={index}
                  style={{
                    backgroundColor: '#f9fafb',
                    borderRadius: '6px',
                    padding: '10px 12px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '12px',
                  }}
                >
                  <span style={{ fontSize: '13px', color: '#374151', flex: 1 }}>{subtask.description}</span>
                  {subtask.child_status && (
                    <span
                      style={{
                        backgroundColor: (STATUS_BADGES[subtask.child_status] || { bg: '#e5e7eb' }).bg,
                        color: (STATUS_BADGES[subtask.child_status] || { text: '#374151' }).text,
                        padding: '2px 8px',
                        borderRadius: '9999px',
                        fontSize: '11px',
                        fontWeight: '500',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {subtask.child_status}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Result */}
        {agent.result && (
          <Section title="Result">
            <div style={{ backgroundColor: '#d1fae5', borderRadius: '8px', padding: '12px', borderLeft: '4px solid #16a34a' }}>
              <p style={{ fontSize: '14px', color: '#065f46', lineHeight: '1.6', margin: 0, whiteSpace: 'pre-wrap' }}>
                {agent.result}
              </p>
            </div>
          </Section>
        )}

        {/* Error */}
        {agent.errorMessage && (
          <Section title="Error">
            <div style={{ backgroundColor: '#fee2e2', borderRadius: '8px', padding: '12px', borderLeft: '4px solid #dc2626' }}>
              <p style={{ fontSize: '14px', color: '#991b1b', lineHeight: '1.6', margin: 0, whiteSpace: 'pre-wrap' }}>
                {agent.errorMessage}
              </p>
            </div>
          </Section>
        )}

        {/* Footer info */}
        <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #e5e7eb', display: 'flex', gap: '16px', fontSize: '12px', color: '#9ca3af' }}>
          <span>Depth: Level {agent.depth}</span>
          <span>{agent.childrenCount} {agent.childrenCount === 1 ? 'child' : 'children'}</span>
        </div>
      </div>
    </div>
  );
}

const initialNodes = [
  {
    "id": "eea8ccdf-57da-4ae9-8632-295c26c382e7",
    "position": {
      "x": 0,
      "y": 900
    },
    "data": {
      "label": "MANAGER (analyzing)\nResearch existing C libraries th...",
      "role": "manager",
      "status": "analyzing",
      "taskDescription": "Research existing C libraries that facilitate recursive directory traversal, focusing on their handling of symbolic links.",
      "complexity": "complex",
      "complexityReasoning": "The task requires research into existing C libraries, which involves exploration and understanding of their handling of symbolic links. This indicates multiple subtasks and dependencies, making it complex rather than straightforward.",
      "configStrategy": "per_operation",
      "configDetails": {
        "complexity_evaluation": {
          "model": "gpt-4o-mini",
          "temperature": 0.3,
          "max_tokens": 300
        },
        "task_decomposition": {
          "model": "gpt-4o",
          "temperature": 0.7,
          "max_tokens": 1500
        },
        "tool": "openhands"
      },
      "workerTool": null,
      "result": null,
      "errorMessage": null,
      "subtasks": [],
      "childrenCount": 0,
      "depth": 5
    },
    "style": {
      "background": "#2563eb",
      "color": "white",
      "border": "none",
      "borderRadius": "8px",
      "padding": "10px",
      "fontSize": "11px",
      "width": 200,
      "cursor": "pointer"
    }
  },
  {
    "id": "c1d62eb3-c936-47f0-aa19-9e8c657a9845",
    "position": {
      "x": 250,
      "y": 900
    },
    "data": {
      "label": "PENDING (analyzing)\nCompile a list of features and l...",
      "role": "pending",
      "status": "analyzing",
      "taskDescription": "Compile a list of features and limitations of the identified C libraries regarding symlink handling.",
      "complexity": null,
      "complexityReasoning": null,
      "configStrategy": "heuristic",
      "configDetails": {
        "base": {
          "model": "gpt-4o-mini",
          "temperature": 0.4,
          "max_tokens": 500
        },
        "tool": "openhands"
      },
      "workerTool": null,
      "result": null,
      "errorMessage": null,
      "subtasks": [],
      "childrenCount": 0,
      "depth": 5
    },
    "style": {
      "background": "#eab308",
      "color": "white",
      "border": "none",
      "borderRadius": "8px",
      "padding": "10px",
      "fontSize": "11px",
      "width": 200,
      "cursor": "pointer"
    }
  },
  {
    "id": "71d06215-5768-4267-9b0b-331e7f1ce955",
    "position": {
      "x": 125.0,
      "y": 720
    },
    "data": {
      "label": "MANAGER (waiting)\nResearch existing C libraries fo...",
      "role": "manager",
      "status": "waiting",
      "taskDescription": "Research existing C libraries for recursive directory traversal with a focus on symlink handling.",
      "complexity": "complex",
      "complexityReasoning": "The task requires research into existing C libraries, which indicates exploration before execution. Additionally, handling symlinks adds complexity and may involve multiple subtasks with dependencies, making it unsuitable for a single session execution.",
      "configStrategy": "heuristic",
      "configDetails": {
        "base": {
          "model": "gpt-4o-mini",
          "temperature": 0.3,
          "max_tokens": 500
        },
        "tool": "openhands"
      },
      "workerTool": null,
      "result": null,
      "errorMessage": null,
      "subtasks": [
        {
          "description": "Research existing C libraries that facilitate recursive directory traversal, focusing on their handling of symbolic links.",
          "child_id": "eea8ccdf-57da-4ae9-8632-295c26c382e7",
          "child_status": "analyzing"
        },
        {
          "description": "Compile a list of features and limitations of the identified C libraries regarding symlink handling.",
          "child_id": "c1d62eb3-c936-47f0-aa19-9e8c657a9845",
          "child_status": "analyzing"
        }
      ],
      "childrenCount": 2,
      "depth": 4
    },
    "style": {
      "background": "#2563eb",
      "color": "white",
      "border": "none",
      "borderRadius": "8px",
      "padding": "10px",
      "fontSize": "11px",
      "width": 200,
      "cursor": "pointer"
    }
  },
  {
    "id": "0218f558-7a15-4933-b69e-aae207dbedd7",
    "position": {
      "x": 500,
      "y": 900
    },
    "data": {
      "label": "PENDING (analyzing)\nEvaluate the pros and cons of th...",
      "role": "pending",
      "status": "analyzing",
      "taskDescription": "Evaluate the pros and cons of the first shortlisted library regarding its symlink handling capabilities and integration ease.",
      "complexity": null,
      "complexityReasoning": null,
      "configStrategy": "per_operation",
      "configDetails": {
        "complexity_evaluation": {
          "model": "gpt-4o-mini",
          "temperature": 0.3,
          "max_tokens": 300
        },
        "task_decomposition": {
          "model": "gpt-4o",
          "temperature": 0.7,
          "max_tokens": 1500
        },
        "tool": "openhands"
      },
      "workerTool": null,
      "result": null,
      "errorMessage": null,
      "subtasks": [],
      "childrenCount": 0,
      "depth": 5
    },
    "style": {
      "background": "#eab308",
      "color": "white",
      "border": "none",
      "borderRadius": "8px",
      "padding": "10px",
      "fontSize": "11px",
      "width": 200,
      "cursor": "pointer"
    }
  },
  {
    "id": "9284afef-fdf1-4b98-9c24-bc7ab51fbdf8",
    "position": {
      "x": 750,
      "y": 900
    },
    "data": {
      "label": "PENDING (analyzing)\nEvaluate the pros and cons of th...",
      "role": "pending",
      "status": "analyzing",
      "taskDescription": "Evaluate the pros and cons of the second shortlisted library regarding its symlink handling capabilities and integration ease.",
      "complexity": null,
      "complexityReasoning": null,
      "configStrategy": "per_operation",
      "configDetails": {
        "complexity_evaluation": {
          "model": "gpt-4o-mini",
          "temperature": 0.3,
          "max_tokens": 300
        },
        "task_decomposition": {
          "model": "gpt-4o",
          "temperature": 0.7,
          "max_tokens": 1500
        },
        "tool": "openhands"
      },
      "workerTool": null,
      "result": null,
      "errorMessage": null,
      "subtasks": [],
      "childrenCount": 0,
      "depth": 5
    },
    "style": {
      "background": "#eab308",
      "color": "white",
      "border": "none",
      "borderRadius": "8px",
      "padding": "10px",
      "fontSize": "11px",
      "width": 200,
      "cursor": "pointer"
    }
  },
  {
    "id": "5a346d93-5d9e-446c-a0c6-2478d656ae59",
    "position": {
      "x": 625.0,
      "y": 720
    },
    "data": {
      "label": "MANAGER (waiting)\nEvaluate the pros and cons of sh...",
      "role": "manager",
      "status": "waiting",
      "taskDescription": "Evaluate the pros and cons of shortlisted libraries based on symlink handling and ease of integration.",
      "complexity": "complex",
      "complexityReasoning": "The task involves evaluating multiple libraries, which requires research and comparison of their symlink handling and integration ease. This suggests multiple subtasks with dependencies and possibly ambiguous requirements, making it complex.",
      "configStrategy": "heuristic",
      "configDetails": {
        "base": {
          "model": "gpt-4o-mini",
          "temperature": 0.4,
          "max_tokens": 600
        },
        "tool": "openhands"
      },
      "workerTool": null,
      "result": null,
      "errorMessage": null,
      "subtasks": [
        {
          "description": "Evaluate the pros and cons of the first shortlisted library regarding its symlink handling capabilities and integration ease.",
          "child_id": "0218f558-7a15-4933-b69e-aae207dbedd7",
          "child_status": "analyzing"
        },
        {
          "description": "Evaluate the pros and cons of the second shortlisted library regarding its symlink handling capabilities and integration ease.",
          "child_id": "9284afef-fdf1-4b98-9c24-bc7ab51fbdf8",
          "child_status": "analyzing"
        }
      ],
      "childrenCount": 2,
      "depth": 4
    },
    "style": {
      "background": "#2563eb",
      "color": "white",
      "border": "none",
      "borderRadius": "8px",
      "padding": "10px",
      "fontSize": "11px",
      "width": 200,
      "cursor": "pointer"
    }
  },
  {
    "id": "1ccc5797-afb2-48c7-a5c3-afc08f98aca4",
    "position": {
      "x": 1000,
      "y": 900
    },
    "data": {
      "label": "PENDING (analyzing)\nResearch and evaluate potential ...",
      "role": "pending",
      "status": "analyzing",
      "taskDescription": "Research and evaluate potential libraries for project recommendations, focusing on their features, performance, and community support.",
      "complexity": null,
      "complexityReasoning": null,
      "configStrategy": "per_operation",
      "configDetails": {
        "complexity_evaluation": {
          "model": "gpt-4o-mini",
          "temperature": 0.3,
          "max_tokens": 300
        },
        "task_decomposition": {
          "model": "gpt-4o",
          "temperature": 0.7,
          "max_tokens": 1500
        },
        "tool": "openhands"
      },
      "workerTool": null,
      "result": null,
      "errorMessage": null,
      "subtasks": [],
      "childrenCount": 0,
      "depth": 5
    },
    "style": {
      "background": "#eab308",
      "color": "white",
      "border": "none",
      "borderRadius": "8px",
      "padding": "10px",
      "fontSize": "11px",
      "width": 200,
      "cursor": "pointer"
    }
  },
  {
    "id": "7a5d11aa-fe2d-4301-9725-7a417ec326fb",
    "position": {
      "x": 1250,
      "y": 900
    },
    "data": {
      "label": "PENDING (analyzing)\nCompile the findings into a stru...",
      "role": "pending",
      "status": "analyzing",
      "taskDescription": "Compile the findings into a structured report, summarizing the pros and cons of each library and providing a final recommendation.",
      "complexity": null,
      "complexityReasoning": null,
      "configStrategy": "heuristic",
      "configDetails": {
        "base": {
          "model": "gpt-4o",
          "temperature": 0.6,
          "max_tokens": 1000
        },
        "tool": "openhands"
      },
      "workerTool": null,
      "result": null,
      "errorMessage": null,
      "subtasks": [],
      "childrenCount": 0,
      "depth": 5
    },
    "style": {
      "background": "#eab308",
      "color": "white",
      "border": "none",
      "borderRadius": "8px",
      "padding": "10px",
      "fontSize": "11px",
      "width": 200,
      "cursor": "pointer"
    }
  },
  {
    "id": "b8f82610-a5ca-48b8-a9b0-2444463087cc",
    "position": {
      "x": 1125.0,
      "y": 720
    },
    "data": {
      "label": "MANAGER (waiting)\nCompile a recommendation report ...",
      "role": "manager",
      "status": "waiting",
      "taskDescription": "Compile a recommendation report on the best library choice for the project.",
      "complexity": "complex",
      "complexityReasoning": "The task requires research to evaluate different libraries, which involves exploring their features, compatibility, and performance. This indicates multiple subtasks and potential dependencies, making it complex rather than a straightforward execution.",
      "configStrategy": "heuristic",
      "configDetails": {
        "base": {
          "model": "gpt-4o-mini",
          "temperature": 0.5,
          "max_tokens": 700
        },
        "tool": "openhands"
      },
      "workerTool": null,
      "result": null,
      "errorMessage": null,
      "subtasks": [
        {
          "description": "Research and evaluate potential libraries for project recommendations, focusing on their features, performance, and community support.",
          "child_id": "1ccc5797-afb2-48c7-a5c3-afc08f98aca4",
          "child_status": "analyzing"
        },
        {
          "description": "Compile the findings into a structured report, summarizing the pros and cons of each library and providing a final recommendation.",
          "child_id": "7a5d11aa-fe2d-4301-9725-7a417ec326fb",
          "child_status": "analyzing"
        }
      ],
      "childrenCount": 2,
      "depth": 4
    },
    "style": {
      "background": "#2563eb",
      "color": "white",
      "border": "none",
      "borderRadius": "8px",
      "padding": "10px",
      "fontSize": "11px",
      "width": 200,
      "cursor": "pointer"
    }
  },
  {
    "id": "5d0f2fbd-7bb9-4906-9b81-33a870cbd2b4",
    "position": {
      "x": 625.0,
      "y": 540
    },
    "data": {
      "label": "MANAGER (waiting)\nResearch and select appropriate ...",
      "role": "manager",
      "status": "waiting",
      "taskDescription": "Research and select appropriate libraries for recursive directory traversal in C, focusing on handling symlinks correctly.",
      "complexity": "complex",
      "complexityReasoning": "The task involves research to identify appropriate libraries, which indicates a need for exploration and understanding of handling symlinks correctly. This suggests multiple subtasks and potential dependencies, making it complex.",
      "configStrategy": "per_operation",
      "configDetails": {
        "complexity_evaluation": {
          "model": "gpt-4o-mini",
          "temperature": 0.3,
          "max_tokens": 300
        },
        "task_decomposition": {
          "model": "gpt-4o",
          "temperature": 0.7,
          "max_tokens": 1500
        },
        "tool": "openhands"
      },
      "workerTool": null,
      "result": null,
      "errorMessage": null,
      "subtasks": [
        {
          "description": "Research existing C libraries for recursive directory traversal with a focus on symlink handling.",
          "child_id": "71d06215-5768-4267-9b0b-331e7f1ce955",
          "child_status": "waiting"
        },
        {
          "description": "Evaluate the pros and cons of shortlisted libraries based on symlink handling and ease of integration.",
          "child_id": "5a346d93-5d9e-446c-a0c6-2478d656ae59",
          "child_status": "waiting"
        },
        {
          "description": "Compile a recommendation report on the best library choice for the project.",
          "child_id": "b8f82610-a5ca-48b8-a9b0-2444463087cc",
          "child_status": "waiting"
        }
      ],
      "childrenCount": 3,
      "depth": 3
    },
    "style": {
      "background": "#2563eb",
      "color": "white",
      "border": "none",
      "borderRadius": "8px",
      "padding": "10px",
      "fontSize": "11px",
      "width": 200,
      "cursor": "pointer"
    }
  },
  {
    "id": "8241d5b9-9c40-461f-a14e-6135e1f5bf9c",
    "position": {
      "x": 1500,
      "y": 720
    },
    "data": {
      "label": "WORKER (completed)\nDevelop a C program to traverse ...",
      "role": "worker",
      "status": "completed",
      "taskDescription": "Develop a C program to traverse directories recursively, ensuring it lists all files.",
      "complexity": "simple",
      "complexityReasoning": "The task is a single well-defined task with clear requirements to traverse directories and list files. It can be executed in one session using standard C libraries without external dependencies.",
      "configStrategy": "heuristic",
      "configDetails": {
        "base": {
          "model": "gpt-4o",
          "temperature": 0.5,
          "max_tokens": 1000
        },
        "tool": "openhands"
      },
      "workerTool": "openhands",
      "result": "Task completed successfully in workspace: /app/output/12dad0e4-f455-4fc0-92e2-0c04644a92e1",
      "errorMessage": null,
      "subtasks": [],
      "childrenCount": 0,
      "depth": 4
    },
    "style": {
      "background": "#16a34a",
      "color": "white",
      "border": "none",
      "borderRadius": "8px",
      "padding": "10px",
      "fontSize": "11px",
      "width": 200,
      "cursor": "pointer"
    }
  },
  {
    "id": "070e4141-6d3f-46ba-8bd0-5f61ce658bff",
    "position": {
      "x": 1750,
      "y": 720
    },
    "data": {
      "label": "WORKER (completed)\nEnhance the C program to handle ...",
      "role": "worker",
      "status": "completed",
      "taskDescription": "Enhance the C program to handle symbolic links appropriately, preventing infinite loops.",
      "complexity": "simple",
      "complexityReasoning": "The task involves enhancing a C program to handle symbolic links, which is a single well-defined task with clear requirements. It can be executed in one session using known patterns and does not require coordination between multiple domains.",
      "configStrategy": "heuristic",
      "configDetails": {
        "base": {
          "model": "gpt-4o",
          "temperature": 0.5,
          "max_tokens": 1000
        },
        "tool": "openhands"
      },
      "workerTool": "openhands",
      "result": "Task completed successfully in workspace: /app/output/12dad0e4-f455-4fc0-92e2-0c04644a92e1",
      "errorMessage": null,
      "subtasks": [],
      "childrenCount": 0,
      "depth": 4
    },
    "style": {
      "background": "#16a34a",
      "color": "white",
      "border": "none",
      "borderRadius": "8px",
      "padding": "10px",
      "fontSize": "11px",
      "width": 200,
      "cursor": "pointer"
    }
  },
  {
    "id": "7cf1198a-57fc-4440-b391-cb29f9dfed67",
    "position": {
      "x": 2000,
      "y": 720
    },
    "data": {
      "label": "WORKER (completed)\nTest the C program to ensure it ...",
      "role": "worker",
      "status": "completed",
      "taskDescription": "Test the C program to ensure it correctly lists files and handles symlinks without errors.",
      "complexity": "simple",
      "complexityReasoning": "The task involves testing a C program to ensure it lists files and handles symlinks correctly, which is a single well-defined task with clear requirements. It can be executed in one session without external dependencies and follows straightforward implementation patterns.",
      "configStrategy": "heuristic",
      "configDetails": {
        "base": {
          "model": "gpt-4o-mini",
          "temperature": 0.3,
          "max_tokens": 500
        },
        "tool": "openhands"
      },
      "workerTool": "openhands",
      "result": "Task completed successfully in workspace: /app/output/12dad0e4-f455-4fc0-92e2-0c04644a92e1",
      "errorMessage": null,
      "subtasks": [],
      "childrenCount": 0,
      "depth": 4
    },
    "style": {
      "background": "#16a34a",
      "color": "white",
      "border": "none",
      "borderRadius": "8px",
      "padding": "10px",
      "fontSize": "11px",
      "width": 200,
      "cursor": "pointer"
    }
  },
  {
    "id": "5deb2acf-cb24-42cf-baed-c8c8f0a9eb46",
    "position": {
      "x": 1750.0,
      "y": 540
    },
    "data": {
      "label": "MANAGER (completed)\nImplement the C program to trave...",
      "role": "manager",
      "status": "completed",
      "taskDescription": "Implement the C program to traverse directories recursively, ensuring it lists all files and handles symlinks appropriately.",
      "complexity": "complex",
      "complexityReasoning": "The task involves multiple subtasks such as directory traversal, symlink handling, and potentially error handling. It requires understanding of file system operations and may involve more than one hour of focused work.",
      "configStrategy": "heuristic",
      "configDetails": {
        "base": {
          "model": "gpt-4o",
          "temperature": 0.5,
          "max_tokens": 1000
        },
        "tool": "openhands"
      },
      "workerTool": null,
      "result": "All subtasks completed successfully:\n\n- Task completed successfully in workspace: /app/output/12dad0e4-f455-4fc0-92e2-0c04644a92e1\n- Task completed successfully in workspace: /app/output/12dad0e4-f455-4fc0-92e2-0c04644a92e1\n- Task completed successfully in workspace: /app/output/12dad0e4-f455-4fc0-92e2-0c04644a92e1",
      "errorMessage": null,
      "subtasks": [
        {
          "description": "Develop a C program to traverse directories recursively, ensuring it lists all files.",
          "child_id": "8241d5b9-9c40-461f-a14e-6135e1f5bf9c",
          "child_status": "completed"
        },
        {
          "description": "Enhance the C program to handle symbolic links appropriately, preventing infinite loops.",
          "child_id": "070e4141-6d3f-46ba-8bd0-5f61ce658bff",
          "child_status": "completed"
        },
        {
          "description": "Test the C program to ensure it correctly lists files and handles symlinks without errors.",
          "child_id": "7cf1198a-57fc-4440-b391-cb29f9dfed67",
          "child_status": "completed"
        }
      ],
      "childrenCount": 3,
      "depth": 3
    },
    "style": {
      "background": "#2563eb",
      "color": "white",
      "border": "none",
      "borderRadius": "8px",
      "padding": "10px",
      "fontSize": "11px",
      "width": 200,
      "cursor": "pointer"
    }
  },
  {
    "id": "ecbeed6d-89ce-429e-bed0-98c527b94977",
    "position": {
      "x": 1000.0,
      "y": 360
    },
    "data": {
      "label": "MANAGER (waiting)\nDevelop a C program to traverse ...",
      "role": "manager",
      "status": "waiting",
      "taskDescription": "Develop a C program to traverse directories recursively and list all files, ensuring proper handling of symlinks.",
      "complexity": "complex",
      "complexityReasoning": "The task involves multiple distinct subtasks: traversing directories, handling symlinks, and ensuring proper file listing. It requires careful handling of edge cases and may involve dependencies on system-level calls, making it complex and likely exceeding one hour of focused work.",
      "configStrategy": "heuristic",
      "configDetails": {
        "base": {
          "model": "gpt-4o-mini",
          "temperature": 0.5,
          "max_tokens": 1000
        },
        "tool": "openhands"
      },
      "workerTool": null,
      "result": null,
      "errorMessage": null,
      "subtasks": [
        {
          "description": "Research and select appropriate libraries for recursive directory traversal in C, focusing on handling symlinks correctly.",
          "child_id": "5d0f2fbd-7bb9-4906-9b81-33a870cbd2b4",
          "child_status": "waiting"
        },
        {
          "description": "Implement the C program to traverse directories recursively, ensuring it lists all files and handles symlinks appropriately.",
          "child_id": "5deb2acf-cb24-42cf-baed-c8c8f0a9eb46",
          "child_status": "completed"
        }
      ],
      "childrenCount": 2,
      "depth": 2
    },
    "style": {
      "background": "#2563eb",
      "color": "white",
      "border": "none",
      "borderRadius": "8px",
      "padding": "10px",
      "fontSize": "11px",
      "width": 200,
      "cursor": "pointer"
    }
  },
  {
    "id": "8f9d34b7-5b0c-4527-b2b6-92be4a23d783",
    "position": {
      "x": 2250,
      "y": 900
    },
    "data": {
      "label": "PENDING (analyzing)\nResearch efficient methods for c...",
      "role": "pending",
      "status": "analyzing",
      "taskDescription": "Research efficient methods for counting files in C, focusing on handling symlinks, and summarize best practices.",
      "complexity": null,
      "complexityReasoning": null,
      "configStrategy": "per_operation",
      "configDetails": {
        "complexity_evaluation": {
          "model": "gpt-4o-mini",
          "temperature": 0.3,
          "max_tokens": 300
        },
        "task_decomposition": {
          "model": "gpt-4o",
          "temperature": 0.7,
          "max_tokens": 1500
        },
        "tool": "openhands"
      },
      "workerTool": null,
      "result": null,
      "errorMessage": null,
      "subtasks": [],
      "childrenCount": 0,
      "depth": 5
    },
    "style": {
      "background": "#eab308",
      "color": "white",
      "border": "none",
      "borderRadius": "8px",
      "padding": "10px",
      "fontSize": "11px",
      "width": 200,
      "cursor": "pointer"
    }
  },
  {
    "id": "f1b75cd2-5781-4e1a-96e0-e788a58679a0",
    "position": {
      "x": 2500,
      "y": 900
    },
    "data": {
      "label": "PENDING (analyzing)\nIdentify and document potential ...",
      "role": "pending",
      "status": "analyzing",
      "taskDescription": "Identify and document potential libraries or system calls in C that facilitate file counting and symlink handling.",
      "complexity": null,
      "complexityReasoning": null,
      "configStrategy": "heuristic",
      "configDetails": {
        "base": {
          "model": "gpt-4o-mini",
          "temperature": 0.5,
          "max_tokens": 500
        },
        "tool": "openhands"
      },
      "workerTool": null,
      "result": null,
      "errorMessage": null,
      "subtasks": [],
      "childrenCount": 0,
      "depth": 5
    },
    "style": {
      "background": "#eab308",
      "color": "white",
      "border": "none",
      "borderRadius": "8px",
      "padding": "10px",
      "fontSize": "11px",
      "width": 200,
      "cursor": "pointer"
    }
  },
  {
    "id": "01e54318-abfd-4b40-aaa0-ae80d3f72b81",
    "position": {
      "x": 2375.0,
      "y": 720
    },
    "data": {
      "label": "MANAGER (waiting)\nResearch best practices for coun...",
      "role": "manager",
      "status": "waiting",
      "taskDescription": "Research best practices for counting files in C, focusing on efficient methods to handle symlinks.",
      "complexity": "complex",
      "complexityReasoning": "Task requires research into best practices, which indicates exploration before execution. Additionally, handling symlinks adds complexity due to potential multiple methods and considerations involved in the implementation.",
      "configStrategy": "heuristic",
      "configDetails": {
        "base": {
          "model": "gpt-4o-mini",
          "temperature": 0.3,
          "max_tokens": 500
        },
        "tool": "openhands"
      },
      "workerTool": null,
      "result": null,
      "errorMessage": null,
      "subtasks": [
        {
          "description": "Research efficient methods for counting files in C, focusing on handling symlinks, and summarize best practices.",
          "child_id": "8f9d34b7-5b0c-4527-b2b6-92be4a23d783",
          "child_status": "analyzing"
        },
        {
          "description": "Identify and document potential libraries or system calls in C that facilitate file counting and symlink handling.",
          "child_id": "f1b75cd2-5781-4e1a-96e0-e788a58679a0",
          "child_status": "analyzing"
        }
      ],
      "childrenCount": 2,
      "depth": 4
    },
    "style": {
      "background": "#2563eb",
      "color": "white",
      "border": "none",
      "borderRadius": "8px",
      "padding": "10px",
      "fontSize": "11px",
      "width": 200,
      "cursor": "pointer"
    }
  },
  {
    "id": "8f4232e6-19f4-4f1a-a77a-848f27c923f8",
    "position": {
      "x": 2750,
      "y": 900
    },
    "data": {
      "label": "PENDING (analyzing)\nResearch methods to identify and...",
      "role": "pending",
      "status": "analyzing",
      "taskDescription": "Research methods to identify and handle duplicate counts caused by symlinks in data processing systems.",
      "complexity": null,
      "complexityReasoning": null,
      "configStrategy": "per_operation",
      "configDetails": {
        "complexity_evaluation": {
          "model": "gpt-4o-mini",
          "temperature": 0.3,
          "max_tokens": 300
        },
        "task_decomposition": {
          "model": "gpt-4o",
          "temperature": 0.7,
          "max_tokens": 1500
        },
        "tool": "openhands"
      },
      "workerTool": null,
      "result": null,
      "errorMessage": null,
      "subtasks": [],
      "childrenCount": 0,
      "depth": 5
    },
    "style": {
      "background": "#eab308",
      "color": "white",
      "border": "none",
      "borderRadius": "8px",
      "padding": "10px",
      "fontSize": "11px",
      "width": 200,
      "cursor": "pointer"
    }
  },
  {
    "id": "a0f9f182-9404-40de-b835-85139a2afcac",
    "position": {
      "x": 3000,
      "y": 900
    },
    "data": {
      "label": "PENDING (analyzing)\nDocument findings and propose a ...",
      "role": "pending",
      "status": "analyzing",
      "taskDescription": "Document findings and propose a strategy to implement changes that avoid duplicate counts due to symlinks.",
      "complexity": null,
      "complexityReasoning": null,
      "configStrategy": "heuristic",
      "configDetails": {
        "base": {
          "model": "gpt-4o",
          "temperature": 0.6,
          "max_tokens": 800
        },
        "tool": "openhands"
      },
      "workerTool": null,
      "result": null,
      "errorMessage": null,
      "subtasks": [],
      "childrenCount": 0,
      "depth": 5
    },
    "style": {
      "background": "#eab308",
      "color": "white",
      "border": "none",
      "borderRadius": "8px",
      "padding": "10px",
      "fontSize": "11px",
      "width": 200,
      "cursor": "pointer"
    }
  },
  {
    "id": "3f526896-d52b-498b-b66d-d5520f38055a",
    "position": {
      "x": 2875.0,
      "y": 720
    },
    "data": {
      "label": "MANAGER (waiting)\nAnalyze strategies to avoid dupl...",
      "role": "manager",
      "status": "waiting",
      "taskDescription": "Analyze strategies to avoid duplicate counts due to symlinks and document findings.",
      "complexity": "complex",
      "complexityReasoning": "The task involves analyzing strategies to avoid duplicate counts due to symlinks, which requires research and exploration of potential solutions. This indicates ambiguous requirements and the need for multiple subtasks to document findings effectively.",
      "configStrategy": "heuristic",
      "configDetails": {
        "base": {
          "model": "gpt-4o-mini",
          "temperature": 0.4,
          "max_tokens": 500
        },
        "tool": "openhands"
      },
      "workerTool": null,
      "result": null,
      "errorMessage": null,
      "subtasks": [
        {
          "description": "Research methods to identify and handle duplicate counts caused by symlinks in data processing systems.",
          "child_id": "8f4232e6-19f4-4f1a-a77a-848f27c923f8",
          "child_status": "analyzing"
        },
        {
          "description": "Document findings and propose a strategy to implement changes that avoid duplicate counts due to symlinks.",
          "child_id": "a0f9f182-9404-40de-b835-85139a2afcac",
          "child_status": "analyzing"
        }
      ],
      "childrenCount": 2,
      "depth": 4
    },
    "style": {
      "background": "#2563eb",
      "color": "white",
      "border": "none",
      "borderRadius": "8px",
      "padding": "10px",
      "fontSize": "11px",
      "width": 200,
      "cursor": "pointer"
    }
  },
  {
    "id": "8877dde7-2066-40e1-943b-d0ede42bbfaf",
    "position": {
      "x": 3250,
      "y": 900
    },
    "data": {
      "label": "PENDING (analyzing)\nCompile and organize the key fin...",
      "role": "pending",
      "status": "analyzing",
      "taskDescription": "Compile and organize the key findings from the research into a structured outline for the comprehensive guide.",
      "complexity": null,
      "complexityReasoning": null,
      "configStrategy": "per_operation",
      "configDetails": {
        "complexity_evaluation": {
          "model": "gpt-4o-mini",
          "temperature": 0.3,
          "max_tokens": 300
        },
        "task_decomposition": {
          "model": "gpt-4o",
          "temperature": 0.7,
          "max_tokens": 1500
        },
        "tool": "openhands"
      },
      "workerTool": null,
      "result": null,
      "errorMessage": null,
      "subtasks": [],
      "childrenCount": 0,
      "depth": 5
    },
    "style": {
      "background": "#eab308",
      "color": "white",
      "border": "none",
      "borderRadius": "8px",
      "padding": "10px",
      "fontSize": "11px",
      "width": 200,
      "cursor": "pointer"
    }
  },
  {
    "id": "60dcd441-f93e-4507-bbe2-a626637c68f7",
    "position": {
      "x": 3500,
      "y": 900
    },
    "data": {
      "label": "PENDING (analyzing)\nDraft detailed sections of the g...",
      "role": "pending",
      "status": "analyzing",
      "taskDescription": "Draft detailed sections of the guide based on the organized outline, ensuring clarity and technical accuracy.",
      "complexity": null,
      "complexityReasoning": null,
      "configStrategy": "heuristic",
      "configDetails": {
        "base": {
          "model": "gpt-4o",
          "temperature": 0.6,
          "max_tokens": 1000
        },
        "tool": "openhands"
      },
      "workerTool": null,
      "result": null,
      "errorMessage": null,
      "subtasks": [],
      "childrenCount": 0,
      "depth": 5
    },
    "style": {
      "background": "#eab308",
      "color": "white",
      "border": "none",
      "borderRadius": "8px",
      "padding": "10px",
      "fontSize": "11px",
      "width": 200,
      "cursor": "pointer"
    }
  },
  {
    "id": "6e30ae1b-b102-4e65-93f9-9b66c6999117",
    "position": {
      "x": 3375.0,
      "y": 720
    },
    "data": {
      "label": "MANAGER (waiting)\nSummarize research findings into...",
      "role": "manager",
      "status": "waiting",
      "taskDescription": "Summarize research findings into a comprehensive guide for developers.",
      "complexity": "complex",
      "complexityReasoning": "The task involves summarizing research findings into a comprehensive guide, which likely requires multiple subtasks such as organizing information, ensuring clarity, and potentially addressing ambiguous requirements. This task may also involve coordination between different domains of knowledge and could exceed one hour of focused work.",
      "configStrategy": "heuristic",
      "configDetails": {
        "base": {
          "model": "gpt-4o-mini",
          "temperature": 0.5,
          "max_tokens": 600
        },
        "tool": "openhands"
      },
      "workerTool": null,
      "result": null,
      "errorMessage": null,
      "subtasks": [
        {
          "description": "Compile and organize the key findings from the research into a structured outline for the comprehensive guide.",
          "child_id": "8877dde7-2066-40e1-943b-d0ede42bbfaf",
          "child_status": "analyzing"
        },
        {
          "description": "Draft detailed sections of the guide based on the organized outline, ensuring clarity and technical accuracy.",
          "child_id": "60dcd441-f93e-4507-bbe2-a626637c68f7",
          "child_status": "analyzing"
        }
      ],
      "childrenCount": 2,
      "depth": 4
    },
    "style": {
      "background": "#2563eb",
      "color": "white",
      "border": "none",
      "borderRadius": "8px",
      "padding": "10px",
      "fontSize": "11px",
      "width": 200,
      "cursor": "pointer"
    }
  },
  {
    "id": "e7514742-56d0-46ff-bc11-e74c04cb38b6",
    "position": {
      "x": 2875.0,
      "y": 540
    },
    "data": {
      "label": "MANAGER (waiting)\nResearch the best practices for ...",
      "role": "manager",
      "status": "waiting",
      "taskDescription": "Research the best practices for counting files in C, specifically focusing on avoiding duplicate counts due to symlinks.",
      "complexity": "complex",
      "complexityReasoning": "The task involves research to identify best practices, which indicates multiple subtasks and potential dependencies. It also requires understanding symlink behavior in C, making it a complex problem that cannot be executed in a single session without prior exploration.",
      "configStrategy": "per_operation",
      "configDetails": {
        "complexity_evaluation": {
          "model": "gpt-4o-mini",
          "temperature": 0.3,
          "max_tokens": 300
        },
        "task_decomposition": {
          "model": "gpt-4o",
          "temperature": 0.7,
          "max_tokens": 1500
        },
        "tool": "openhands"
      },
      "workerTool": null,
      "result": null,
      "errorMessage": null,
      "subtasks": [
        {
          "description": "Research best practices for counting files in C, focusing on efficient methods to handle symlinks.",
          "child_id": "01e54318-abfd-4b40-aaa0-ae80d3f72b81",
          "child_status": "waiting"
        },
        {
          "description": "Analyze strategies to avoid duplicate counts due to symlinks and document findings.",
          "child_id": "3f526896-d52b-498b-b66d-d5520f38055a",
          "child_status": "waiting"
        },
        {
          "description": "Summarize research findings into a comprehensive guide for developers.",
          "child_id": "6e30ae1b-b102-4e65-93f9-9b66c6999117",
          "child_status": "waiting"
        }
      ],
      "childrenCount": 3,
      "depth": 3
    },
    "style": {
      "background": "#2563eb",
      "color": "white",
      "border": "none",
      "borderRadius": "8px",
      "padding": "10px",
      "fontSize": "11px",
      "width": 200,
      "cursor": "pointer"
    }
  },
  {
    "id": "e46af355-802d-4215-98b3-5eedf9865042",
    "position": {
      "x": 3750,
      "y": 540
    },
    "data": {
      "label": "WORKER (completed)\nImplement the logic in C to coun...",
      "role": "worker",
      "status": "completed",
      "taskDescription": "Implement the logic in C to count files while ensuring symlinks are not double-counted.",
      "complexity": "simple",
      "complexityReasoning": "The task is a single well-defined task with clear requirements to implement logic in C for counting files while ensuring symlinks are not double-counted. It involves straightforward implementation with no external dependencies beyond standard libraries.",
      "configStrategy": "heuristic",
      "configDetails": {
        "base": {
          "model": "gpt-4o",
          "temperature": 0.5,
          "max_tokens": 1000
        },
        "tool": "openhands"
      },
      "workerTool": "openhands",
      "result": "Task completed successfully in workspace: /app/output/12dad0e4-f455-4fc0-92e2-0c04644a92e1",
      "errorMessage": null,
      "subtasks": [],
      "childrenCount": 0,
      "depth": 3
    },
    "style": {
      "background": "#16a34a",
      "color": "white",
      "border": "none",
      "borderRadius": "8px",
      "padding": "10px",
      "fontSize": "11px",
      "width": 200,
      "cursor": "pointer"
    }
  },
  {
    "id": "e2564d1a-69b7-4a15-a441-f5fcd9e68349",
    "position": {
      "x": 3000.0,
      "y": 360
    },
    "data": {
      "label": "MANAGER (waiting)\nImplement logic in the C program...",
      "role": "manager",
      "status": "waiting",
      "taskDescription": "Implement logic in the C program to count the files, taking care to avoid counting duplicates due to symlinks.",
      "complexity": "complex",
      "complexityReasoning": "The task involves implementing logic that requires careful handling of symlinks to avoid counting duplicates, which suggests multiple subtasks and potential dependencies. It may also require research into file handling and symlink behavior in C, indicating a need for exploration before execution.",
      "configStrategy": "heuristic",
      "configDetails": {
        "base": {
          "model": "gpt-4o-mini",
          "temperature": 0.5,
          "max_tokens": 1000
        },
        "tool": "openhands"
      },
      "workerTool": null,
      "result": null,
      "errorMessage": null,
      "subtasks": [
        {
          "description": "Research the best practices for counting files in C, specifically focusing on avoiding duplicate counts due to symlinks.",
          "child_id": "e7514742-56d0-46ff-bc11-e74c04cb38b6",
          "child_status": "waiting"
        },
        {
          "description": "Implement the logic in C to count files while ensuring symlinks are not double-counted.",
          "child_id": "e46af355-802d-4215-98b3-5eedf9865042",
          "child_status": "completed"
        }
      ],
      "childrenCount": 2,
      "depth": 2
    },
    "style": {
      "background": "#2563eb",
      "color": "white",
      "border": "none",
      "borderRadius": "8px",
      "padding": "10px",
      "fontSize": "11px",
      "width": 200,
      "cursor": "pointer"
    }
  },
  {
    "id": "9f976938-0a49-449a-937a-6d94ac71cb27",
    "position": {
      "x": 4000,
      "y": 720
    },
    "data": {
      "label": "WORKER (completed)\nTest C program on typical direct...",
      "role": "worker",
      "status": "completed",
      "taskDescription": "Test C program on typical directory structures to ensure expected functionality",
      "complexity": "simple",
      "complexityReasoning": "The task is to test a C program on typical directory structures, which is a single well-defined task with clear requirements. It can be executed in one session without external dependencies, making it straightforward.",
      "configStrategy": "heuristic",
      "configDetails": {
        "base": {
          "model": "gpt-4o-mini",
          "temperature": 0.4,
          "max_tokens": 800
        },
        "tool": "openhands"
      },
      "workerTool": "openhands",
      "result": "Task completed successfully in workspace: /app/output/12dad0e4-f455-4fc0-92e2-0c04644a92e1",
      "errorMessage": null,
      "subtasks": [],
      "childrenCount": 0,
      "depth": 4
    },
    "style": {
      "background": "#16a34a",
      "color": "white",
      "border": "none",
      "borderRadius": "8px",
      "padding": "10px",
      "fontSize": "11px",
      "width": 200,
      "cursor": "pointer"
    }
  },
  {
    "id": "1876c57b-b34c-40ed-a852-4bd5dc15b8b7",
    "position": {
      "x": 4250,
      "y": 900
    },
    "data": {
      "label": "MANAGER (analyzing)\nIdentify and create a list of ed...",
      "role": "manager",
      "status": "analyzing",
      "taskDescription": "Identify and create a list of edge case directory structures to test the C program's robustness.",
      "complexity": "complex",
      "complexityReasoning": "The task involves identifying and creating a list of edge case directory structures, which requires exploration and consideration of various scenarios that could affect the C program's robustness. This indicates multiple subtasks with dependencies and potential research, making it complex.",
      "configStrategy": "heuristic",
      "configDetails": {
        "base": {
          "model": "gpt-4o-mini",
          "temperature": 0.3,
          "max_tokens": 500
        },
        "tool": "openhands"
      },
      "workerTool": null,
      "result": null,
      "errorMessage": null,
      "subtasks": [],
      "childrenCount": 0,
      "depth": 5
    },
    "style": {
      "background": "#2563eb",
      "color": "white",
      "border": "none",
      "borderRadius": "8px",
      "padding": "10px",
      "fontSize": "11px",
      "width": 200,
      "cursor": "pointer"
    }
  },
  {
    "id": "d97fb941-dc53-40e8-af2e-5bc80583d917",
    "position": {
      "x": 4500,
      "y": 900
    },
    "data": {
      "label": "MANAGER (analyzing)\nDevelop automated test scripts t...",
      "role": "manager",
      "status": "analyzing",
      "taskDescription": "Develop automated test scripts to execute the C program against the identified edge case directory structures.",
      "complexity": "complex",
      "complexityReasoning": "The task involves developing automated test scripts, which may require understanding the C program, identifying edge cases, and setting up test environments. This suggests multiple subtasks and potential dependencies, making it complex.",
      "configStrategy": "heuristic",
      "configDetails": {
        "base": {
          "model": "gpt-4o",
          "temperature": 0.5,
          "max_tokens": 1000
        },
        "tool": "openhands"
      },
      "workerTool": null,
      "result": null,
      "errorMessage": null,
      "subtasks": [],
      "childrenCount": 0,
      "depth": 5
    },
    "style": {
      "background": "#2563eb",
      "color": "white",
      "border": "none",
      "borderRadius": "8px",
      "padding": "10px",
      "fontSize": "11px",
      "width": 200,
      "cursor": "pointer"
    }
  },
  {
    "id": "11204d9e-6453-4adf-86a7-a1aaeae2cd1e",
    "position": {
      "x": 4750,
      "y": 900
    },
    "data": {
      "label": "MANAGER (analyzing)\nAnalyze the test results to iden...",
      "role": "manager",
      "status": "analyzing",
      "taskDescription": "Analyze the test results to identify any failures or unexpected behaviors in the C program.",
      "complexity": "complex",
      "complexityReasoning": "The task involves analyzing test results, which may require investigating multiple aspects of the C program, identifying failures, and understanding unexpected behaviors. This could involve multiple subtasks with dependencies, such as reviewing different test cases and possibly needing clarification on ambiguous results.",
      "configStrategy": "heuristic",
      "configDetails": {
        "base": {
          "model": "gpt-4o-mini",
          "temperature": 0.4,
          "max_tokens": 600
        },
        "tool": "openhands"
      },
      "workerTool": null,
      "result": null,
      "errorMessage": null,
      "subtasks": [],
      "childrenCount": 0,
      "depth": 5
    },
    "style": {
      "background": "#2563eb",
      "color": "white",
      "border": "none",
      "borderRadius": "8px",
      "padding": "10px",
      "fontSize": "11px",
      "width": 200,
      "cursor": "pointer"
    }
  },
  {
    "id": "76932a27-3c7a-4d25-9f10-5cba2a2f71e4",
    "position": {
      "x": 4500.0,
      "y": 720
    },
    "data": {
      "label": "MANAGER (waiting)\nTest C program with edge case di...",
      "role": "manager",
      "status": "waiting",
      "taskDescription": "Test C program with edge case directory structures to validate robustness",
      "complexity": "complex",
      "complexityReasoning": "The task involves testing a C program with edge case directory structures, which may require creating multiple test scenarios and handling various file system edge cases. This suggests multiple subtasks and potential dependencies, making it complex.",
      "configStrategy": "heuristic",
      "configDetails": {
        "base": {
          "model": "gpt-4o",
          "temperature": 0.5,
          "max_tokens": 1000
        },
        "tool": "openhands"
      },
      "workerTool": null,
      "result": null,
      "errorMessage": null,
      "subtasks": [
        {
          "description": "Identify and create a list of edge case directory structures to test the C program's robustness.",
          "child_id": "1876c57b-b34c-40ed-a852-4bd5dc15b8b7",
          "child_status": "analyzing"
        },
        {
          "description": "Develop automated test scripts to execute the C program against the identified edge case directory structures.",
          "child_id": "d97fb941-dc53-40e8-af2e-5bc80583d917",
          "child_status": "analyzing"
        },
        {
          "description": "Analyze the test results to identify any failures or unexpected behaviors in the C program.",
          "child_id": "11204d9e-6453-4adf-86a7-a1aaeae2cd1e",
          "child_status": "analyzing"
        }
      ],
      "childrenCount": 3,
      "depth": 4
    },
    "style": {
      "background": "#2563eb",
      "color": "white",
      "border": "none",
      "borderRadius": "8px",
      "padding": "10px",
      "fontSize": "11px",
      "width": 200,
      "cursor": "pointer"
    }
  },
  {
    "id": "c7ba6168-631e-4a4c-89f1-4132cf4fcaa9",
    "position": {
      "x": 5000,
      "y": 720
    },
    "data": {
      "label": "WORKER (completed)\nDocument test results, highlight...",
      "role": "worker",
      "status": "completed",
      "taskDescription": "Document test results, highlighting any issues or unexpected behavior",
      "complexity": "simple",
      "complexityReasoning": "The task of documenting test results is a single well-defined task with clear requirements. It can be executed in one session and does not involve any external dependencies or complex implementation.",
      "configStrategy": "heuristic",
      "configDetails": {
        "base": {
          "model": "gpt-4o-mini",
          "temperature": 0.3,
          "max_tokens": 600
        },
        "tool": "openhands"
      },
      "workerTool": "openhands",
      "result": "Task completed successfully in workspace: /app/output/12dad0e4-f455-4fc0-92e2-0c04644a92e1",
      "errorMessage": null,
      "subtasks": [],
      "childrenCount": 0,
      "depth": 4
    },
    "style": {
      "background": "#16a34a",
      "color": "white",
      "border": "none",
      "borderRadius": "8px",
      "padding": "10px",
      "fontSize": "11px",
      "width": 200,
      "cursor": "pointer"
    }
  },
  {
    "id": "0f975760-5fab-4b57-89a9-8d90ce902e78",
    "position": {
      "x": 4500.0,
      "y": 540
    },
    "data": {
      "label": "MANAGER (waiting)\nConduct a comprehensive correctn...",
      "role": "manager",
      "status": "waiting",
      "taskDescription": "Conduct a comprehensive correctness test of the C program across various directory structures, ensuring it handles edge cases and typical scenarios.",
      "complexity": "complex",
      "complexityReasoning": "The task involves conducting a comprehensive correctness test across various directory structures, which suggests multiple distinct scenarios and edge cases. This indicates multiple subtasks with dependencies, requiring thorough exploration and potentially architectural considerations for effective testing.",
      "configStrategy": "per_operation",
      "configDetails": {
        "complexity_evaluation": {
          "model": "gpt-4o-mini",
          "temperature": 0.3,
          "max_tokens": 300
        },
        "task_decomposition": {
          "model": "gpt-4o",
          "temperature": 0.7,
          "max_tokens": 1500
        },
        "tool": "openhands"
      },
      "workerTool": null,
      "result": null,
      "errorMessage": null,
      "subtasks": [
        {
          "description": "Test C program on typical directory structures to ensure expected functionality",
          "child_id": "9f976938-0a49-449a-937a-6d94ac71cb27",
          "child_status": "completed"
        },
        {
          "description": "Test C program with edge case directory structures to validate robustness",
          "child_id": "76932a27-3c7a-4d25-9f10-5cba2a2f71e4",
          "child_status": "waiting"
        },
        {
          "description": "Document test results, highlighting any issues or unexpected behavior",
          "child_id": "c7ba6168-631e-4a4c-89f1-4132cf4fcaa9",
          "child_status": "completed"
        }
      ],
      "childrenCount": 3,
      "depth": 3
    },
    "style": {
      "background": "#2563eb",
      "color": "white",
      "border": "none",
      "borderRadius": "8px",
      "padding": "10px",
      "fontSize": "11px",
      "width": 200,
      "cursor": "pointer"
    }
  },
  {
    "id": "f4b76abc-a0d1-4e21-b95c-1f8baf386163",
    "position": {
      "x": 5250,
      "y": 900
    },
    "data": {
      "label": "WORKER (analyzing)\nSet up various directory structu...",
      "role": "worker",
      "status": "analyzing",
      "taskDescription": "Set up various directory structures for the C program and document the configurations used for performance evaluation.",
      "complexity": "simple",
      "complexityReasoning": "The task involves setting up directory structures and documenting configurations, which are single well-defined tasks with clear requirements. It can be executed in one session without external dependencies and involves straightforward implementation.",
      "configStrategy": "heuristic",
      "configDetails": {
        "base": {
          "model": "gpt-4o-mini",
          "temperature": 0.3,
          "max_tokens": 500
        },
        "tool": "openhands"
      },
      "workerTool": null,
      "result": null,
      "errorMessage": null,
      "subtasks": [],
      "childrenCount": 0,
      "depth": 5
    },
    "style": {
      "background": "#16a34a",
      "color": "white",
      "border": "none",
      "borderRadius": "8px",
      "padding": "10px",
      "fontSize": "11px",
      "width": 200,
      "cursor": "pointer"
    }
  },
  {
    "id": "afd538d5-88a1-4c9a-a6b5-5982585f448b",
    "position": {
      "x": 5500,
      "y": 900
    },
    "data": {
      "label": "PENDING (analyzing)\nRun the C program under differen...",
      "role": "pending",
      "status": "analyzing",
      "taskDescription": "Run the C program under different directory structures and collect execution time metrics for each configuration.",
      "complexity": null,
      "complexityReasoning": null,
      "configStrategy": "heuristic",
      "configDetails": {
        "base": {
          "model": "gpt-4o",
          "temperature": 0.5,
          "max_tokens": 800
        },
        "tool": "openhands"
      },
      "workerTool": null,
      "result": null,
      "errorMessage": null,
      "subtasks": [],
      "childrenCount": 0,
      "depth": 5
    },
    "style": {
      "background": "#eab308",
      "color": "white",
      "border": "none",
      "borderRadius": "8px",
      "padding": "10px",
      "fontSize": "11px",
      "width": 200,
      "cursor": "pointer"
    }
  },
  {
    "id": "557d2597-3990-42ca-b4ef-45900e48fd09",
    "position": {
      "x": 5375.0,
      "y": 720
    },
    "data": {
      "label": "MANAGER (waiting)\nEvaluate the C program's perform...",
      "role": "manager",
      "status": "waiting",
      "taskDescription": "Evaluate the C program's performance under various directory structures, collecting execution time metrics.",
      "complexity": "complex",
      "complexityReasoning": "The task involves evaluating a C program's performance under various directory structures, which requires multiple distinct subtasks such as setting up different directory structures, running the program, and collecting execution time metrics. This indicates dependencies and potential research on performance metrics, making it complex.",
      "configStrategy": "heuristic",
      "configDetails": {
        "base": {
          "model": "gpt-4o-mini",
          "temperature": 0.4,
          "max_tokens": 800
        },
        "tool": "openhands"
      },
      "workerTool": null,
      "result": null,
      "errorMessage": null,
      "subtasks": [
        {
          "description": "Set up various directory structures for the C program and document the configurations used for performance evaluation.",
          "child_id": "f4b76abc-a0d1-4e21-b95c-1f8baf386163",
          "child_status": "analyzing"
        },
        {
          "description": "Run the C program under different directory structures and collect execution time metrics for each configuration.",
          "child_id": "afd538d5-88a1-4c9a-a6b5-5982585f448b",
          "child_status": "analyzing"
        }
      ],
      "childrenCount": 2,
      "depth": 4
    },
    "style": {
      "background": "#2563eb",
      "color": "white",
      "border": "none",
      "borderRadius": "8px",
      "padding": "10px",
      "fontSize": "11px",
      "width": 200,
      "cursor": "pointer"
    }
  },
  {
    "id": "b571efd5-663a-4e2e-8385-00a8f9311102",
    "position": {
      "x": 5750,
      "y": 900
    },
    "data": {
      "label": "MANAGER (analyzing)\nConduct performance testing unde...",
      "role": "manager",
      "status": "analyzing",
      "taskDescription": "Conduct performance testing under various load conditions to gather metrics on CPU and memory usage.",
      "complexity": "complex",
      "complexityReasoning": "The task involves conducting performance testing under various load conditions, which requires multiple distinct subtasks such as setting up the testing environment, defining load scenarios, and analyzing metrics. This spans multiple domains and necessitates careful coordination and planning, making it complex.",
      "configStrategy": "per_operation",
      "configDetails": {
        "complexity_evaluation": {
          "model": "gpt-4o-mini",
          "temperature": 0.3,
          "max_tokens": 300
        },
        "task_decomposition": {
          "model": "gpt-4o",
          "temperature": 0.7,
          "max_tokens": 1500
        },
        "tool": "openhands"
      },
      "workerTool": null,
      "result": null,
      "errorMessage": null,
      "subtasks": [],
      "childrenCount": 0,
      "depth": 5
    },
    "style": {
      "background": "#2563eb",
      "color": "white",
      "border": "none",
      "borderRadius": "8px",
      "padding": "10px",
      "fontSize": "11px",
      "width": 200,
      "cursor": "pointer"
    }
  },
  {
    "id": "0faff1b0-dc05-454e-9033-b040e387580d",
    "position": {
      "x": 6000,
      "y": 900
    },
    "data": {
      "label": "MANAGER (analyzing)\nAnalyze the collected resource u...",
      "role": "manager",
      "status": "analyzing",
      "taskDescription": "Analyze the collected resource usage metrics to identify performance bottlenecks and optimization opportunities.",
      "complexity": "complex",
      "complexityReasoning": "The task involves analyzing resource usage metrics to identify performance bottlenecks and optimization opportunities, which may require research, exploration, and potentially multiple subtasks with dependencies. It is likely to involve architectural decisions and coordination across different system components.",
      "configStrategy": "heuristic",
      "configDetails": {
        "base": {
          "model": "gpt-4o",
          "temperature": 0.6,
          "max_tokens": 1000
        },
        "tool": "openhands"
      },
      "workerTool": null,
      "result": null,
      "errorMessage": null,
      "subtasks": [],
      "childrenCount": 0,
      "depth": 5
    },
    "style": {
      "background": "#2563eb",
      "color": "white",
      "border": "none",
      "borderRadius": "8px",
      "padding": "10px",
      "fontSize": "11px",
      "width": 200,
      "cursor": "pointer"
    }
  },
  {
    "id": "2ace6cc4-7583-4922-8237-120ea2a9c299",
    "position": {
      "x": 5875.0,
      "y": 720
    },
    "data": {
      "label": "MANAGER (waiting)\nAnalyze the program's performanc...",
      "role": "manager",
      "status": "waiting",
      "taskDescription": "Analyze the program's performance under different load conditions, gathering resource usage metrics.",
      "complexity": "complex",
      "complexityReasoning": "The task involves analyzing program performance under different load conditions, which requires gathering metrics, potentially across multiple systems and configurations. This indicates multiple subtasks with dependencies and possibly ambiguous requirements, thus necessitating decomposition.",
      "configStrategy": "heuristic",
      "configDetails": {
        "base": {
          "model": "gpt-4o-mini",
          "temperature": 0.4,
          "max_tokens": 800
        },
        "tool": "openhands"
      },
      "workerTool": null,
      "result": null,
      "errorMessage": null,
      "subtasks": [
        {
          "description": "Conduct performance testing under various load conditions to gather metrics on CPU and memory usage.",
          "child_id": "b571efd5-663a-4e2e-8385-00a8f9311102",
          "child_status": "analyzing"
        },
        {
          "description": "Analyze the collected resource usage metrics to identify performance bottlenecks and optimization opportunities.",
          "child_id": "0faff1b0-dc05-454e-9033-b040e387580d",
          "child_status": "analyzing"
        }
      ],
      "childrenCount": 2,
      "depth": 4
    },
    "style": {
      "background": "#2563eb",
      "color": "white",
      "border": "none",
      "borderRadius": "8px",
      "padding": "10px",
      "fontSize": "11px",
      "width": 200,
      "cursor": "pointer"
    }
  },
  {
    "id": "e2c5617c-a1d3-4848-bd93-0fa2a05917fc",
    "position": {
      "x": 6250,
      "y": 900
    },
    "data": {
      "label": "MANAGER (analyzing)\nAnalyze collected metrics to ide...",
      "role": "manager",
      "status": "analyzing",
      "taskDescription": "Analyze collected metrics to identify key performance bottlenecks",
      "complexity": "complex",
      "complexityReasoning": "The task involves analyzing collected metrics to identify key performance bottlenecks, which may require research and exploration. It could involve multiple subtasks such as data collection, analysis, and reporting, and may span multiple domains.",
      "configStrategy": "hybrid",
      "configDetails": {
        "base": {
          "model": "gpt-4o",
          "temperature": 0.5,
          "max_tokens": 1000
        },
        "overrides": {
          "complexity_evaluation": {
            "max_tokens": 300,
            "temperature": 0.3
          }
        },
        "tool": "openhands"
      },
      "workerTool": null,
      "result": null,
      "errorMessage": null,
      "subtasks": [],
      "childrenCount": 0,
      "depth": 5
    },
    "style": {
      "background": "#2563eb",
      "color": "white",
      "border": "none",
      "borderRadius": "8px",
      "padding": "10px",
      "fontSize": "11px",
      "width": 200,
      "cursor": "pointer"
    }
  },
  {
    "id": "da16b404-9d8d-435d-a151-6bd9e55e45ef",
    "position": {
      "x": 6500,
      "y": 900
    },
    "data": {
      "label": "PENDING (analyzing)\nGenerate detailed recommendation...",
      "role": "pending",
      "status": "analyzing",
      "taskDescription": "Generate detailed recommendations for optimizing performance based on identified bottlenecks",
      "complexity": null,
      "complexityReasoning": null,
      "configStrategy": "heuristic",
      "configDetails": {
        "base": {
          "model": "gpt-4o",
          "temperature": 0.7,
          "max_tokens": 1500
        },
        "tool": "openhands"
      },
      "workerTool": null,
      "result": null,
      "errorMessage": null,
      "subtasks": [],
      "childrenCount": 0,
      "depth": 5
    },
    "style": {
      "background": "#eab308",
      "color": "white",
      "border": "none",
      "borderRadius": "8px",
      "padding": "10px",
      "fontSize": "11px",
      "width": 200,
      "cursor": "pointer"
    }
  },
  {
    "id": "d293fb47-42f1-4301-8b32-d62657ea022f",
    "position": {
      "x": 6375.0,
      "y": 720
    },
    "data": {
      "label": "MANAGER (waiting)\nSynthesize collected metrics to ...",
      "role": "manager",
      "status": "waiting",
      "taskDescription": "Synthesize collected metrics to identify performance bottlenecks and provide recommendations.",
      "complexity": "complex",
      "complexityReasoning": "The task involves synthesizing metrics to identify performance bottlenecks, which requires analysis across multiple domains. It may involve ambiguous requirements and necessitates research and exploration to provide recommendations, indicating multiple subtasks with dependencies.",
      "configStrategy": "heuristic",
      "configDetails": {
        "base": {
          "model": "gpt-4o",
          "temperature": 0.5,
          "max_tokens": 1000
        },
        "tool": "openhands"
      },
      "workerTool": null,
      "result": null,
      "errorMessage": null,
      "subtasks": [
        {
          "description": "Analyze collected metrics to identify key performance bottlenecks",
          "child_id": "e2c5617c-a1d3-4848-bd93-0fa2a05917fc",
          "child_status": "analyzing"
        },
        {
          "description": "Generate detailed recommendations for optimizing performance based on identified bottlenecks",
          "child_id": "da16b404-9d8d-435d-a151-6bd9e55e45ef",
          "child_status": "analyzing"
        }
      ],
      "childrenCount": 2,
      "depth": 4
    },
    "style": {
      "background": "#2563eb",
      "color": "white",
      "border": "none",
      "borderRadius": "8px",
      "padding": "10px",
      "fontSize": "11px",
      "width": 200,
      "cursor": "pointer"
    }
  },
  {
    "id": "7f255488-2522-4a71-98ff-d409e659f35c",
    "position": {
      "x": 5875.0,
      "y": 540
    },
    "data": {
      "label": "MANAGER (waiting)\nEvaluate the performance of the ...",
      "role": "manager",
      "status": "waiting",
      "taskDescription": "Evaluate the performance of the C program under different directory structures and load conditions, collecting metrics on execution time and resource usage.",
      "complexity": "complex",
      "complexityReasoning": "The task involves evaluating performance under different directory structures and load conditions, which requires collecting metrics on execution time and resource usage. This suggests multiple subtasks with dependencies and potential research, making it complex.",
      "configStrategy": "heuristic",
      "configDetails": {
        "base": {
          "model": "gpt-4o",
          "temperature": 0.5,
          "max_tokens": 1000
        },
        "tool": "openhands"
      },
      "workerTool": null,
      "result": null,
      "errorMessage": null,
      "subtasks": [
        {
          "description": "Evaluate the C program's performance under various directory structures, collecting execution time metrics.",
          "child_id": "557d2597-3990-42ca-b4ef-45900e48fd09",
          "child_status": "waiting"
        },
        {
          "description": "Analyze the program's performance under different load conditions, gathering resource usage metrics.",
          "child_id": "2ace6cc4-7583-4922-8237-120ea2a9c299",
          "child_status": "waiting"
        },
        {
          "description": "Synthesize collected metrics to identify performance bottlenecks and provide recommendations.",
          "child_id": "d293fb47-42f1-4301-8b32-d62657ea022f",
          "child_status": "waiting"
        }
      ],
      "childrenCount": 3,
      "depth": 3
    },
    "style": {
      "background": "#2563eb",
      "color": "white",
      "border": "none",
      "borderRadius": "8px",
      "padding": "10px",
      "fontSize": "11px",
      "width": 200,
      "cursor": "pointer"
    }
  },
  {
    "id": "76bc175d-c8e2-4c40-8813-9c0c551f9561",
    "position": {
      "x": 5250.0,
      "y": 360
    },
    "data": {
      "label": "MANAGER (waiting)\nTest the C program for correctne...",
      "role": "manager",
      "status": "waiting",
      "taskDescription": "Test the C program for correctness and performance, ensuring it handles a variety of directory structures.",
      "complexity": "complex",
      "complexityReasoning": "The task involves testing a C program for correctness and performance across various directory structures, which suggests multiple subtasks with dependencies, such as setting up different test cases and evaluating performance metrics. Additionally, it may require research to determine the best practices for performance testing in C, making it complex.",
      "configStrategy": "heuristic",
      "configDetails": {
        "base": {
          "model": "gpt-4o-mini",
          "temperature": 0.4,
          "max_tokens": 500
        },
        "tool": "openhands"
      },
      "workerTool": null,
      "result": null,
      "errorMessage": null,
      "subtasks": [
        {
          "description": "Conduct a comprehensive correctness test of the C program across various directory structures, ensuring it handles edge cases and typical scenarios.",
          "child_id": "0f975760-5fab-4b57-89a9-8d90ce902e78",
          "child_status": "waiting"
        },
        {
          "description": "Evaluate the performance of the C program under different directory structures and load conditions, collecting metrics on execution time and resource usage.",
          "child_id": "7f255488-2522-4a71-98ff-d409e659f35c",
          "child_status": "waiting"
        }
      ],
      "childrenCount": 2,
      "depth": 2
    },
    "style": {
      "background": "#2563eb",
      "color": "white",
      "border": "none",
      "borderRadius": "8px",
      "padding": "10px",
      "fontSize": "11px",
      "width": 200,
      "cursor": "pointer"
    }
  },
  {
    "id": "4243afcf-8d3b-44bc-9f1d-24f3b175326c",
    "position": {
      "x": 3250.0,
      "y": 180
    },
    "data": {
      "label": "MANAGER (waiting)\nCreate a C program that traverse...",
      "role": "manager",
      "status": "waiting",
      "taskDescription": "Create a C program that traverses the current directory and counts all files recursively, ensuring to handle symlinks properly.",
      "complexity": "complex",
      "complexityReasoning": "The task involves multiple distinct subtasks: traversing directories, counting files, and handling symlinks properly. It requires careful consideration of file system behavior and may involve dependencies on system calls, making it complex and potentially requiring more than one session to execute effectively.",
      "configStrategy": "per_operation",
      "configDetails": {
        "complexity_evaluation": {
          "model": "gpt-4o-mini",
          "temperature": 0.3,
          "max_tokens": 300
        },
        "task_decomposition": {
          "model": "gpt-4o",
          "temperature": 0.6,
          "max_tokens": 1200
        },
        "tool": "openhands"
      },
      "workerTool": null,
      "result": null,
      "errorMessage": null,
      "subtasks": [
        {
          "description": "Develop a C program to traverse directories recursively and list all files, ensuring proper handling of symlinks.",
          "child_id": "ecbeed6d-89ce-429e-bed0-98c527b94977",
          "child_status": "waiting"
        },
        {
          "description": "Implement logic in the C program to count the files, taking care to avoid counting duplicates due to symlinks.",
          "child_id": "e2564d1a-69b7-4a15-a441-f5fcd9e68349",
          "child_status": "waiting"
        },
        {
          "description": "Test the C program for correctness and performance, ensuring it handles a variety of directory structures.",
          "child_id": "76bc175d-c8e2-4c40-8813-9c0c551f9561",
          "child_status": "waiting"
        }
      ],
      "childrenCount": 3,
      "depth": 1
    },
    "style": {
      "background": "#2563eb",
      "color": "white",
      "border": "none",
      "borderRadius": "8px",
      "padding": "10px",
      "fontSize": "11px",
      "width": 200,
      "cursor": "pointer"
    }
  },
  {
    "id": "b391907b-dde4-4cfd-9b07-5f18910158bc",
    "position": {
      "x": 6750,
      "y": 360
    },
    "data": {
      "label": "WORKER (completed)\nWrite unit tests for counting fi...",
      "role": "worker",
      "status": "completed",
      "taskDescription": "Write unit tests for counting files in a directory, including tests for edge cases like empty directories and permission issues.",
      "complexity": "simple",
      "complexityReasoning": "The task involves writing unit tests for a specific function, which is a single well-defined task with clear requirements. It can be executed in one session, does not have external dependencies, and follows straightforward implementation patterns.",
      "configStrategy": "heuristic",
      "configDetails": {
        "base": {
          "model": "gpt-4o-mini",
          "temperature": 0.3,
          "max_tokens": 500
        },
        "tool": "openhands"
      },
      "workerTool": "openhands",
      "result": "Task completed successfully in workspace: /app/output/12dad0e4-f455-4fc0-92e2-0c04644a92e1",
      "errorMessage": null,
      "subtasks": [],
      "childrenCount": 0,
      "depth": 2
    },
    "style": {
      "background": "#16a34a",
      "color": "white",
      "border": "none",
      "borderRadius": "8px",
      "padding": "10px",
      "fontSize": "11px",
      "width": 200,
      "cursor": "pointer"
    }
  },
  {
    "id": "334d055d-b9e9-4246-85ca-723cc9461952",
    "position": {
      "x": 7000,
      "y": 900
    },
    "data": {
      "label": "PENDING (analyzing)\nResearch how symbolic links are ...",
      "role": "pending",
      "status": "analyzing",
      "taskDescription": "Research how symbolic links are counted in various file systems, focusing on common behaviors and differences.",
      "complexity": null,
      "complexityReasoning": null,
      "configStrategy": "per_operation",
      "configDetails": {
        "complexity_evaluation": {
          "model": "gpt-4o-mini",
          "temperature": 0.3,
          "max_tokens": 300
        },
        "task_decomposition": {
          "model": "gpt-4o",
          "temperature": 0.7,
          "max_tokens": 1500
        },
        "tool": "openhands"
      },
      "workerTool": null,
      "result": null,
      "errorMessage": null,
      "subtasks": [],
      "childrenCount": 0,
      "depth": 5
    },
    "style": {
      "background": "#eab308",
      "color": "white",
      "border": "none",
      "borderRadius": "8px",
      "padding": "10px",
      "fontSize": "11px",
      "width": 200,
      "cursor": "pointer"
    }
  },
  {
    "id": "5319343c-2f18-4a84-8dea-2357c7802fa8",
    "position": {
      "x": 7250,
      "y": 900
    },
    "data": {
      "label": "PENDING (analyzing)\nDocument findings on symbolic li...",
      "role": "pending",
      "status": "analyzing",
      "taskDescription": "Document findings on symbolic link behaviors across different file systems, including examples and edge cases.",
      "complexity": null,
      "complexityReasoning": null,
      "configStrategy": "heuristic",
      "configDetails": {
        "base": {
          "model": "gpt-4o-mini",
          "temperature": 0.5,
          "max_tokens": 800
        },
        "tool": "openhands"
      },
      "workerTool": null,
      "result": null,
      "errorMessage": null,
      "subtasks": [],
      "childrenCount": 0,
      "depth": 5
    },
    "style": {
      "background": "#eab308",
      "color": "white",
      "border": "none",
      "borderRadius": "8px",
      "padding": "10px",
      "fontSize": "11px",
      "width": 200,
      "cursor": "pointer"
    }
  },
  {
    "id": "de8c233a-1394-4ddc-8922-0923281b5906",
    "position": {
      "x": 7125.0,
      "y": 720
    },
    "data": {
      "label": "MANAGER (waiting)\nResearch and document how symbol...",
      "role": "manager",
      "status": "waiting",
      "taskDescription": "Research and document how symbolic links are counted in file systems, identifying common behaviors across different systems.",
      "complexity": "complex",
      "complexityReasoning": "Task requires research to identify and document behaviors across different file systems, indicating multiple distinct domains and potential dependencies. It involves exploration and analysis, which suggests it cannot be executed in a single session and may take longer than one hour.",
      "configStrategy": "heuristic",
      "configDetails": {
        "base": {
          "model": "gpt-4o-mini",
          "temperature": 0.3,
          "max_tokens": 600
        },
        "tool": "openhands"
      },
      "workerTool": null,
      "result": null,
      "errorMessage": null,
      "subtasks": [
        {
          "description": "Research how symbolic links are counted in various file systems, focusing on common behaviors and differences.",
          "child_id": "334d055d-b9e9-4246-85ca-723cc9461952",
          "child_status": "analyzing"
        },
        {
          "description": "Document findings on symbolic link behaviors across different file systems, including examples and edge cases.",
          "child_id": "5319343c-2f18-4a84-8dea-2357c7802fa8",
          "child_status": "analyzing"
        }
      ],
      "childrenCount": 2,
      "depth": 4
    },
    "style": {
      "background": "#2563eb",
      "color": "white",
      "border": "none",
      "borderRadius": "8px",
      "padding": "10px",
      "fontSize": "11px",
      "width": 200,
      "cursor": "pointer"
    }
  },
  {
    "id": "06e89123-13f4-4fa3-83ca-ba3c74eaa469",
    "position": {
      "x": 7500,
      "y": 900
    },
    "data": {
      "label": "PENDING (analyzing)\nResearch and document common pit...",
      "role": "pending",
      "status": "analyzing",
      "taskDescription": "Research and document common pitfalls encountered when counting symbolic links, including potential errors and inconsistencies.",
      "complexity": null,
      "complexityReasoning": null,
      "configStrategy": "per_operation",
      "configDetails": {
        "complexity_evaluation": {
          "model": "gpt-4o-mini",
          "temperature": 0.3,
          "max_tokens": 300
        },
        "task_decomposition": {
          "model": "gpt-4o",
          "temperature": 0.7,
          "max_tokens": 1500
        },
        "tool": "openhands"
      },
      "workerTool": null,
      "result": null,
      "errorMessage": null,
      "subtasks": [],
      "childrenCount": 0,
      "depth": 5
    },
    "style": {
      "background": "#eab308",
      "color": "white",
      "border": "none",
      "borderRadius": "8px",
      "padding": "10px",
      "fontSize": "11px",
      "width": 200,
      "cursor": "pointer"
    }
  },
  {
    "id": "421f7f89-73dd-4d1b-adb4-9f5454f8c827",
    "position": {
      "x": 7750,
      "y": 900
    },
    "data": {
      "label": "PENDING (analyzing)\nAnalyze the implications of symb...",
      "role": "pending",
      "status": "analyzing",
      "taskDescription": "Analyze the implications of symbolic link counting errors on system performance and data integrity.",
      "complexity": null,
      "complexityReasoning": null,
      "configStrategy": "heuristic",
      "configDetails": {
        "base": {
          "model": "gpt-4o",
          "temperature": 0.5,
          "max_tokens": 800
        },
        "tool": "openhands"
      },
      "workerTool": null,
      "result": null,
      "errorMessage": null,
      "subtasks": [],
      "childrenCount": 0,
      "depth": 5
    },
    "style": {
      "background": "#eab308",
      "color": "white",
      "border": "none",
      "borderRadius": "8px",
      "padding": "10px",
      "fontSize": "11px",
      "width": 200,
      "cursor": "pointer"
    }
  },
  {
    "id": "a9c46963-bbf7-4593-ad0c-e21c8458ec31",
    "position": {
      "x": 7625.0,
      "y": 720
    },
    "data": {
      "label": "MANAGER (waiting)\nIdentify and document potential ...",
      "role": "manager",
      "status": "waiting",
      "taskDescription": "Identify and document potential pitfalls when counting symbolic links, including possible errors or inconsistencies.",
      "complexity": "complex",
      "complexityReasoning": "The task involves identifying and documenting potential pitfalls, which requires research and exploration of various errors and inconsistencies. This suggests multiple subtasks with dependencies and potentially ambiguous requirements, indicating a need for decomposition.",
      "configStrategy": "heuristic",
      "configDetails": {
        "base": {
          "model": "gpt-4o-mini",
          "temperature": 0.4,
          "max_tokens": 700
        },
        "tool": "openhands"
      },
      "workerTool": null,
      "result": null,
      "errorMessage": null,
      "subtasks": [
        {
          "description": "Research and document common pitfalls encountered when counting symbolic links, including potential errors and inconsistencies.",
          "child_id": "06e89123-13f4-4fa3-83ca-ba3c74eaa469",
          "child_status": "analyzing"
        },
        {
          "description": "Analyze the implications of symbolic link counting errors on system performance and data integrity.",
          "child_id": "421f7f89-73dd-4d1b-adb4-9f5454f8c827",
          "child_status": "analyzing"
        }
      ],
      "childrenCount": 2,
      "depth": 4
    },
    "style": {
      "background": "#2563eb",
      "color": "white",
      "border": "none",
      "borderRadius": "8px",
      "padding": "10px",
      "fontSize": "11px",
      "width": 200,
      "cursor": "pointer"
    }
  },
  {
    "id": "bb7385c9-5a65-4fb6-b00c-a6f3e75103c2",
    "position": {
      "x": 8000,
      "y": 900
    },
    "data": {
      "label": "PENDING (analyzing)\nResearch best practices for hand...",
      "role": "pending",
      "status": "analyzing",
      "taskDescription": "Research best practices for handling symbolic links in file systems, focusing on pitfalls and solutions.",
      "complexity": null,
      "complexityReasoning": null,
      "configStrategy": "heuristic",
      "configDetails": {
        "base": {
          "model": "gpt-4o-mini",
          "temperature": 0.3,
          "max_tokens": 500
        },
        "tool": "openhands"
      },
      "workerTool": null,
      "result": null,
      "errorMessage": null,
      "subtasks": [],
      "childrenCount": 0,
      "depth": 5
    },
    "style": {
      "background": "#eab308",
      "color": "white",
      "border": "none",
      "borderRadius": "8px",
      "padding": "10px",
      "fontSize": "11px",
      "width": 200,
      "cursor": "pointer"
    }
  },
  {
    "id": "533343f4-33b1-4c7e-966a-7c731c88b1fc",
    "position": {
      "x": 8250,
      "y": 900
    },
    "data": {
      "label": "MANAGER (analyzing)\nDevelop guidelines for safely co...",
      "role": "manager",
      "status": "analyzing",
      "taskDescription": "Develop guidelines for safely counting files in directories with symbolic links, incorporating research findings.",
      "complexity": "complex",
      "complexityReasoning": "The task involves research to develop guidelines and safely handle symbolic links, which suggests multiple subtasks and potential dependencies. It requires exploration and understanding of file systems, making it complex.",
      "configStrategy": "heuristic",
      "configDetails": {
        "base": {
          "model": "gpt-4o",
          "temperature": 0.5,
          "max_tokens": 800
        },
        "tool": "openhands"
      },
      "workerTool": null,
      "result": null,
      "errorMessage": null,
      "subtasks": [],
      "childrenCount": 0,
      "depth": 5
    },
    "style": {
      "background": "#2563eb",
      "color": "white",
      "border": "none",
      "borderRadius": "8px",
      "padding": "10px",
      "fontSize": "11px",
      "width": 200,
      "cursor": "pointer"
    }
  },
  {
    "id": "7a4ab8b4-f8d0-41f4-8888-7de4224182e4",
    "position": {
      "x": 8500,
      "y": 900
    },
    "data": {
      "label": "MANAGER (analyzing)\nCreate a testing framework to va...",
      "role": "manager",
      "status": "analyzing",
      "taskDescription": "Create a testing framework to validate the guidelines for handling symbolic links in various scenarios.",
      "complexity": "complex",
      "complexityReasoning": "The task involves creating a testing framework, which requires multiple distinct subtasks such as defining test cases, handling various scenarios for symbolic links, and potentially integrating with existing systems. This indicates a need for research and exploration, as well as architectural decisions, making it complex.",
      "configStrategy": "heuristic",
      "configDetails": {
        "base": {
          "model": "gpt-4o-mini",
          "temperature": 0.4,
          "max_tokens": 600
        },
        "tool": "openhands"
      },
      "workerTool": null,
      "result": null,
      "errorMessage": null,
      "subtasks": [],
      "childrenCount": 0,
      "depth": 5
    },
    "style": {
      "background": "#2563eb",
      "color": "white",
      "border": "none",
      "borderRadius": "8px",
      "padding": "10px",
      "fontSize": "11px",
      "width": 200,
      "cursor": "pointer"
    }
  },
  {
    "id": "2009a517-a527-40a7-ad9e-02eaf4b2b6cf",
    "position": {
      "x": 8250.0,
      "y": 720
    },
    "data": {
      "label": "MANAGER (waiting)\nDevelop guidelines for handling ...",
      "role": "manager",
      "status": "waiting",
      "taskDescription": "Develop guidelines for handling symbolic links in file counting to avoid the identified pitfalls.",
      "complexity": "complex",
      "complexityReasoning": "The task involves developing guidelines which may require research into best practices and potential pitfalls associated with symbolic links in file counting. It is likely to involve multiple steps, including understanding the problem, exploring solutions, and drafting comprehensive guidelines, which suggests a multi-step workflow with dependencies.",
      "configStrategy": "heuristic",
      "configDetails": {
        "base": {
          "model": "gpt-4o",
          "temperature": 0.5,
          "max_tokens": 800
        },
        "tool": "openhands"
      },
      "workerTool": null,
      "result": null,
      "errorMessage": null,
      "subtasks": [
        {
          "description": "Research best practices for handling symbolic links in file systems, focusing on pitfalls and solutions.",
          "child_id": "bb7385c9-5a65-4fb6-b00c-a6f3e75103c2",
          "child_status": "analyzing"
        },
        {
          "description": "Develop guidelines for safely counting files in directories with symbolic links, incorporating research findings.",
          "child_id": "533343f4-33b1-4c7e-966a-7c731c88b1fc",
          "child_status": "analyzing"
        },
        {
          "description": "Create a testing framework to validate the guidelines for handling symbolic links in various scenarios.",
          "child_id": "7a4ab8b4-f8d0-41f4-8888-7de4224182e4",
          "child_status": "analyzing"
        }
      ],
      "childrenCount": 3,
      "depth": 4
    },
    "style": {
      "background": "#2563eb",
      "color": "white",
      "border": "none",
      "borderRadius": "8px",
      "padding": "10px",
      "fontSize": "11px",
      "width": 200,
      "cursor": "pointer"
    }
  },
  {
    "id": "4257b335-15ce-4d9f-bae9-cc62911c2283",
    "position": {
      "x": 7750.0,
      "y": 540
    },
    "data": {
      "label": "MANAGER (waiting)\nIdentify and document edge cases...",
      "role": "manager",
      "status": "waiting",
      "taskDescription": "Identify and document edge cases related to symbolic links in file counting, including how they are counted and any potential pitfalls.",
      "complexity": "complex",
      "complexityReasoning": "The task involves identifying and documenting edge cases, which requires research and exploration of how symbolic links affect file counting. This indicates multiple subtasks with dependencies and potential ambiguities that need clarification.",
      "configStrategy": "per_operation",
      "configDetails": {
        "complexity_evaluation": {
          "model": "gpt-4o-mini",
          "temperature": 0.3,
          "max_tokens": 300
        },
        "task_decomposition": {
          "model": "gpt-4o",
          "temperature": 0.7,
          "max_tokens": 1500
        },
        "tool": "openhands"
      },
      "workerTool": null,
      "result": null,
      "errorMessage": null,
      "subtasks": [
        {
          "description": "Research and document how symbolic links are counted in file systems, identifying common behaviors across different systems.",
          "child_id": "de8c233a-1394-4ddc-8922-0923281b5906",
          "child_status": "waiting"
        },
        {
          "description": "Identify and document potential pitfalls when counting symbolic links, including possible errors or inconsistencies.",
          "child_id": "a9c46963-bbf7-4593-ad0c-e21c8458ec31",
          "child_status": "waiting"
        },
        {
          "description": "Develop guidelines for handling symbolic links in file counting to avoid the identified pitfalls.",
          "child_id": "2009a517-a527-40a7-ad9e-02eaf4b2b6cf",
          "child_status": "waiting"
        }
      ],
      "childrenCount": 3,
      "depth": 3
    },
    "style": {
      "background": "#2563eb",
      "color": "white",
      "border": "none",
      "borderRadius": "8px",
      "padding": "10px",
      "fontSize": "11px",
      "width": 200,
      "cursor": "pointer"
    }
  },
  {
    "id": "1818ba8a-0ece-41f5-a581-d00f6d11ee0b",
    "position": {
      "x": 8750,
      "y": 900
    },
    "data": {
      "label": "PENDING (analyzing)\nResearch common scenarios where ...",
      "role": "pending",
      "status": "analyzing",
      "taskDescription": "Research common scenarios where permission errors affect file counting, focusing on access denial cases in various operating systems.",
      "complexity": null,
      "complexityReasoning": null,
      "configStrategy": "per_operation",
      "configDetails": {
        "complexity_evaluation": {
          "model": "gpt-4o-mini",
          "temperature": 0.3,
          "max_tokens": 300
        },
        "task_decomposition": {
          "model": "gpt-4o",
          "temperature": 0.7,
          "max_tokens": 1500
        },
        "tool": "openhands"
      },
      "workerTool": null,
      "result": null,
      "errorMessage": null,
      "subtasks": [],
      "childrenCount": 0,
      "depth": 5
    },
    "style": {
      "background": "#eab308",
      "color": "white",
      "border": "none",
      "borderRadius": "8px",
      "padding": "10px",
      "fontSize": "11px",
      "width": 200,
      "cursor": "pointer"
    }
  },
  {
    "id": "ee96d106-52d9-4b24-9a4e-62fc04487311",
    "position": {
      "x": 9000,
      "y": 900
    },
    "data": {
      "label": "MANAGER (analyzing)\nAnalyze the impact of different ...",
      "role": "manager",
      "status": "analyzing",
      "taskDescription": "Analyze the impact of different permission settings on file counting, documenting specific cases of access denial.",
      "complexity": "complex",
      "complexityReasoning": "The task involves analyzing the impact of different permission settings, which requires research into access control mechanisms and potentially multiple cases of access denial. This indicates multiple subtasks with dependencies and the need for clear documentation, making it complex.",
      "configStrategy": "heuristic",
      "configDetails": {
        "base": {
          "model": "gpt-4o-mini",
          "temperature": 0.4,
          "max_tokens": 800
        },
        "tool": "openhands"
      },
      "workerTool": null,
      "result": null,
      "errorMessage": null,
      "subtasks": [],
      "childrenCount": 0,
      "depth": 5
    },
    "style": {
      "background": "#2563eb",
      "color": "white",
      "border": "none",
      "borderRadius": "8px",
      "padding": "10px",
      "fontSize": "11px",
      "width": 200,
      "cursor": "pointer"
    }
  },
  {
    "id": "3c731d3e-b803-4e29-8f04-cf3d98f607b4",
    "position": {
      "x": 8875.0,
      "y": 720
    },
    "data": {
      "label": "MANAGER (waiting)\nResearch common scenarios where ...",
      "role": "manager",
      "status": "waiting",
      "taskDescription": "Research common scenarios where permission errors affect file counting, focusing on access denial cases",
      "complexity": "complex",
      "complexityReasoning": "Task requires research into various scenarios of permission errors, which involves exploration and understanding of access denial cases. This indicates multiple subtasks and potential dependencies, making it complex.",
      "configStrategy": "heuristic",
      "configDetails": {
        "base": {
          "model": "gpt-4o-mini",
          "temperature": 0.3,
          "max_tokens": 800
        },
        "tool": "openhands"
      },
      "workerTool": null,
      "result": null,
      "errorMessage": null,
      "subtasks": [
        {
          "description": "Research common scenarios where permission errors affect file counting, focusing on access denial cases in various operating systems.",
          "child_id": "1818ba8a-0ece-41f5-a581-d00f6d11ee0b",
          "child_status": "analyzing"
        },
        {
          "description": "Analyze the impact of different permission settings on file counting, documenting specific cases of access denial.",
          "child_id": "ee96d106-52d9-4b24-9a4e-62fc04487311",
          "child_status": "analyzing"
        }
      ],
      "childrenCount": 2,
      "depth": 4
    },
    "style": {
      "background": "#2563eb",
      "color": "white",
      "border": "none",
      "borderRadius": "8px",
      "padding": "10px",
      "fontSize": "11px",
      "width": 200,
      "cursor": "pointer"
    }
  },
  {
    "id": "3f9d1dd3-d7a9-4932-9aea-c9e063d33c6f",
    "position": {
      "x": 9250,
      "y": 900
    },
    "data": {
      "label": "MANAGER (analyzing)\nResearch common permission error...",
      "role": "manager",
      "status": "analyzing",
      "taskDescription": "Research common permission errors encountered in file counting processes and document typical solutions for each error type.",
      "complexity": "complex",
      "complexityReasoning": "Task requires research into various permission errors, which involves exploring multiple error types and documenting solutions. This indicates multiple subtasks with dependencies and the need for exploration before execution.",
      "configStrategy": "per_operation",
      "configDetails": {
        "complexity_evaluation": {
          "model": "gpt-4o-mini",
          "temperature": 0.3,
          "max_tokens": 300
        },
        "task_decomposition": {
          "model": "gpt-4o",
          "temperature": 0.7,
          "max_tokens": 1500
        },
        "tool": "openhands"
      },
      "workerTool": null,
      "result": null,
      "errorMessage": null,
      "subtasks": [],
      "childrenCount": 0,
      "depth": 5
    },
    "style": {
      "background": "#2563eb",
      "color": "white",
      "border": "none",
      "borderRadius": "8px",
      "padding": "10px",
      "fontSize": "11px",
      "width": 200,
      "cursor": "pointer"
    }
  },
  {
    "id": "64824aec-1a74-4da8-8018-79e166e25dbd",
    "position": {
      "x": 9500,
      "y": 900
    },
    "data": {
      "label": "PENDING (analyzing)\nCompile a list of workarounds fo...",
      "role": "pending",
      "status": "analyzing",
      "taskDescription": "Compile a list of workarounds for handling permission errors in file counting processes, including code snippets and best practices.",
      "complexity": null,
      "complexityReasoning": null,
      "configStrategy": "heuristic",
      "configDetails": {
        "base": {
          "model": "gpt-4o",
          "temperature": 0.6,
          "max_tokens": 1000
        },
        "tool": "openhands"
      },
      "workerTool": null,
      "result": null,
      "errorMessage": null,
      "subtasks": [],
      "childrenCount": 0,
      "depth": 5
    },
    "style": {
      "background": "#eab308",
      "color": "white",
      "border": "none",
      "borderRadius": "8px",
      "padding": "10px",
      "fontSize": "11px",
      "width": 200,
      "cursor": "pointer"
    }
  },
  {
    "id": "7a651bc1-5044-43c5-949e-508653376e9a",
    "position": {
      "x": 9375.0,
      "y": 720
    },
    "data": {
      "label": "MANAGER (waiting)\nDocument typical solutions and w...",
      "role": "manager",
      "status": "waiting",
      "taskDescription": "Document typical solutions and workarounds for handling permission errors in file counting processes",
      "complexity": "complex",
      "complexityReasoning": "The task involves documenting solutions and workarounds for permission errors, which may require research into various scenarios and handling methods. This indicates potential ambiguity in requirements and the need for multiple subtasks, such as identifying common permission errors and their respective solutions.",
      "configStrategy": "heuristic",
      "configDetails": {
        "base": {
          "model": "gpt-4o-mini",
          "temperature": 0.3,
          "max_tokens": 600
        },
        "tool": "openhands"
      },
      "workerTool": null,
      "result": null,
      "errorMessage": null,
      "subtasks": [
        {
          "description": "Research common permission errors encountered in file counting processes and document typical solutions for each error type.",
          "child_id": "3f9d1dd3-d7a9-4932-9aea-c9e063d33c6f",
          "child_status": "analyzing"
        },
        {
          "description": "Compile a list of workarounds for handling permission errors in file counting processes, including code snippets and best practices.",
          "child_id": "64824aec-1a74-4da8-8018-79e166e25dbd",
          "child_status": "analyzing"
        }
      ],
      "childrenCount": 2,
      "depth": 4
    },
    "style": {
      "background": "#2563eb",
      "color": "white",
      "border": "none",
      "borderRadius": "8px",
      "padding": "10px",
      "fontSize": "11px",
      "width": 200,
      "cursor": "pointer"
    }
  },
  {
    "id": "257897b0-e025-4a56-9347-a344955d7114",
    "position": {
      "x": 9750,
      "y": 900
    },
    "data": {
      "label": "PENDING (analyzing)\nCompile the research findings in...",
      "role": "pending",
      "status": "analyzing",
      "taskDescription": "Compile the research findings into a structured outline for the report, focusing on key themes and categories of permission errors in file counting.",
      "complexity": null,
      "complexityReasoning": null,
      "configStrategy": "per_operation",
      "configDetails": {
        "complexity_evaluation": {
          "model": "gpt-4o-mini",
          "temperature": 0.3,
          "max_tokens": 300
        },
        "task_decomposition": {
          "model": "gpt-4o",
          "temperature": 0.7,
          "max_tokens": 1500
        },
        "tool": "openhands"
      },
      "workerTool": null,
      "result": null,
      "errorMessage": null,
      "subtasks": [],
      "childrenCount": 0,
      "depth": 5
    },
    "style": {
      "background": "#eab308",
      "color": "white",
      "border": "none",
      "borderRadius": "8px",
      "padding": "10px",
      "fontSize": "11px",
      "width": 200,
      "cursor": "pointer"
    }
  },
  {
    "id": "792271dc-19cd-4a5b-b637-2f1329fca1cd",
    "position": {
      "x": 10000,
      "y": 900
    },
    "data": {
      "label": "PENDING (analyzing)\nDraft the comprehensive report b...",
      "role": "pending",
      "status": "analyzing",
      "taskDescription": "Draft the comprehensive report based on the outline, ensuring clarity and thoroughness in explaining the permission errors identified during research.",
      "complexity": null,
      "complexityReasoning": null,
      "configStrategy": "heuristic",
      "configDetails": {
        "base": {
          "model": "gpt-4o",
          "temperature": 0.6,
          "max_tokens": 1000
        },
        "tool": "openhands"
      },
      "workerTool": null,
      "result": null,
      "errorMessage": null,
      "subtasks": [],
      "childrenCount": 0,
      "depth": 5
    },
    "style": {
      "background": "#eab308",
      "color": "white",
      "border": "none",
      "borderRadius": "8px",
      "padding": "10px",
      "fontSize": "11px",
      "width": 200,
      "cursor": "pointer"
    }
  },
  {
    "id": "8275041a-d417-4969-ad7f-8daa463fa6f6",
    "position": {
      "x": 9875.0,
      "y": 720
    },
    "data": {
      "label": "MANAGER (waiting)\nCompile and format the research ...",
      "role": "manager",
      "status": "waiting",
      "taskDescription": "Compile and format the research findings into a comprehensive report on permission errors in file counting",
      "complexity": "complex",
      "complexityReasoning": "The task involves compiling and formatting research findings, which suggests multiple subtasks such as data analysis, report structuring, and potentially addressing ambiguous requirements regarding the content. It likely requires coordination of information from different sources and may involve design decisions for the report layout.",
      "configStrategy": "heuristic",
      "configDetails": {
        "base": {
          "model": "gpt-4o-mini",
          "temperature": 0.4,
          "max_tokens": 1000
        },
        "tool": "openhands"
      },
      "workerTool": null,
      "result": null,
      "errorMessage": null,
      "subtasks": [
        {
          "description": "Compile the research findings into a structured outline for the report, focusing on key themes and categories of permission errors in file counting.",
          "child_id": "257897b0-e025-4a56-9347-a344955d7114",
          "child_status": "analyzing"
        },
        {
          "description": "Draft the comprehensive report based on the outline, ensuring clarity and thoroughness in explaining the permission errors identified during research.",
          "child_id": "792271dc-19cd-4a5b-b637-2f1329fca1cd",
          "child_status": "analyzing"
        }
      ],
      "childrenCount": 2,
      "depth": 4
    },
    "style": {
      "background": "#2563eb",
      "color": "white",
      "border": "none",
      "borderRadius": "8px",
      "padding": "10px",
      "fontSize": "11px",
      "width": 200,
      "cursor": "pointer"
    }
  },
  {
    "id": "4ec0f67d-459b-4e64-bdbe-03b976bb1729",
    "position": {
      "x": 9375.0,
      "y": 540
    },
    "data": {
      "label": "MANAGER (waiting)\nResearch and document how permis...",
      "role": "manager",
      "status": "waiting",
      "taskDescription": "Research and document how permission errors affect file counting, including scenarios where access is denied.",
      "complexity": "complex",
      "complexityReasoning": "The task requires research to understand how permission errors affect file counting, which introduces multiple scenarios and potential dependencies. This indicates a need for exploration and documentation of various cases, making it complex.",
      "configStrategy": "per_operation",
      "configDetails": {
        "complexity_evaluation": {
          "model": "gpt-4o-mini",
          "temperature": 0.3,
          "max_tokens": 300
        },
        "task_decomposition": {
          "model": "gpt-4o",
          "temperature": 0.7,
          "max_tokens": 1500
        },
        "tool": "openhands"
      },
      "workerTool": null,
      "result": null,
      "errorMessage": null,
      "subtasks": [
        {
          "description": "Research common scenarios where permission errors affect file counting, focusing on access denial cases",
          "child_id": "3c731d3e-b803-4e29-8f04-cf3d98f607b4",
          "child_status": "waiting"
        },
        {
          "description": "Document typical solutions and workarounds for handling permission errors in file counting processes",
          "child_id": "7a651bc1-5044-43c5-949e-508653376e9a",
          "child_status": "waiting"
        },
        {
          "description": "Compile and format the research findings into a comprehensive report on permission errors in file counting",
          "child_id": "8275041a-d417-4969-ad7f-8daa463fa6f6",
          "child_status": "waiting"
        }
      ],
      "childrenCount": 3,
      "depth": 3
    },
    "style": {
      "background": "#2563eb",
      "color": "white",
      "border": "none",
      "borderRadius": "8px",
      "padding": "10px",
      "fontSize": "11px",
      "width": 200,
      "cursor": "pointer"
    }
  },
  {
    "id": "ad2ede90-58b0-4039-a6de-77c62ea26590",
    "position": {
      "x": 10250,
      "y": 900
    },
    "data": {
      "label": "PENDING (analyzing)\nResearch the performance issues ...",
      "role": "pending",
      "status": "analyzing",
      "taskDescription": "Research the performance issues associated with counting files in large directories, focusing on time complexity and potential bottlenecks.",
      "complexity": null,
      "complexityReasoning": null,
      "configStrategy": "per_operation",
      "configDetails": {
        "complexity_evaluation": {
          "model": "gpt-4o-mini",
          "temperature": 0.3,
          "max_tokens": 300
        },
        "task_decomposition": {
          "model": "gpt-4o",
          "temperature": 0.7,
          "max_tokens": 1500
        },
        "tool": "openhands"
      },
      "workerTool": null,
      "result": null,
      "errorMessage": null,
      "subtasks": [],
      "childrenCount": 0,
      "depth": 5
    },
    "style": {
      "background": "#eab308",
      "color": "white",
      "border": "none",
      "borderRadius": "8px",
      "padding": "10px",
      "fontSize": "11px",
      "width": 200,
      "cursor": "pointer"
    }
  },
  {
    "id": "bc6c6196-e686-4d08-bf8d-79a6e5f72b70",
    "position": {
      "x": 10500,
      "y": 900
    },
    "data": {
      "label": "PENDING (analyzing)\nDocument the findings on perform...",
      "role": "pending",
      "status": "analyzing",
      "taskDescription": "Document the findings on performance issues, including time complexity considerations and suggested optimizations.",
      "complexity": null,
      "complexityReasoning": null,
      "configStrategy": "heuristic",
      "configDetails": {
        "base": {
          "model": "gpt-4o-mini",
          "temperature": 0.4,
          "max_tokens": 800
        },
        "tool": "openhands"
      },
      "workerTool": null,
      "result": null,
      "errorMessage": null,
      "subtasks": [],
      "childrenCount": 0,
      "depth": 5
    },
    "style": {
      "background": "#eab308",
      "color": "white",
      "border": "none",
      "borderRadius": "8px",
      "padding": "10px",
      "fontSize": "11px",
      "width": 200,
      "cursor": "pointer"
    }
  },
  {
    "id": "21fbb5db-c88e-4593-a749-f7d3055f4df7",
    "position": {
      "x": 10375.0,
      "y": 720
    },
    "data": {
      "label": "MANAGER (waiting)\nResearch and document the perfor...",
      "role": "manager",
      "status": "waiting",
      "taskDescription": "Research and document the performance issues associated with counting files in large directories, including time complexity considerations.",
      "complexity": "complex",
      "complexityReasoning": "The task requires research into performance issues and time complexity considerations, indicating multiple distinct domains and potential dependencies. It involves exploration and documentation, which suggests it cannot be executed in one session and may require decomposition into subtasks.",
      "configStrategy": "heuristic",
      "configDetails": {
        "base": {
          "model": "gpt-4o-mini",
          "temperature": 0.3,
          "max_tokens": 800
        },
        "tool": "openhands"
      },
      "workerTool": null,
      "result": null,
      "errorMessage": null,
      "subtasks": [
        {
          "description": "Research the performance issues associated with counting files in large directories, focusing on time complexity and potential bottlenecks.",
          "child_id": "ad2ede90-58b0-4039-a6de-77c62ea26590",
          "child_status": "analyzing"
        },
        {
          "description": "Document the findings on performance issues, including time complexity considerations and suggested optimizations.",
          "child_id": "bc6c6196-e686-4d08-bf8d-79a6e5f72b70",
          "child_status": "analyzing"
        }
      ],
      "childrenCount": 2,
      "depth": 4
    },
    "style": {
      "background": "#2563eb",
      "color": "white",
      "border": "none",
      "borderRadius": "8px",
      "padding": "10px",
      "fontSize": "11px",
      "width": 200,
      "cursor": "pointer"
    }
  },
  {
    "id": "6bfaea4b-be4d-49c3-98ac-5933f1e2d405",
    "position": {
      "x": 10750,
      "y": 900
    },
    "data": {
      "label": "MANAGER (analyzing)\nResearch existing algorithms for...",
      "role": "manager",
      "status": "analyzing",
      "taskDescription": "Research existing algorithms for counting files in large directories and summarize their methodologies and approaches.",
      "complexity": "complex",
      "complexityReasoning": "The task involves research into existing algorithms, which requires exploration and analysis of various methodologies. This indicates multiple subtasks with dependencies and potentially ambiguous requirements, making it complex.",
      "configStrategy": "per_operation",
      "configDetails": {
        "complexity_evaluation": {
          "model": "gpt-4o-mini",
          "temperature": 0.3,
          "max_tokens": 300
        },
        "task_decomposition": {
          "model": "gpt-4o",
          "temperature": 0.7,
          "max_tokens": 1500
        },
        "tool": "openhands"
      },
      "workerTool": null,
      "result": null,
      "errorMessage": null,
      "subtasks": [],
      "childrenCount": 0,
      "depth": 5
    },
    "style": {
      "background": "#2563eb",
      "color": "white",
      "border": "none",
      "borderRadius": "8px",
      "padding": "10px",
      "fontSize": "11px",
      "width": 200,
      "cursor": "pointer"
    }
  },
  {
    "id": "70229716-1ccd-42c0-9341-bc25b57350ff",
    "position": {
      "x": 11000,
      "y": 900
    },
    "data": {
      "label": "PENDING (analyzing)\nEvaluate the efficiency and scal...",
      "role": "pending",
      "status": "analyzing",
      "taskDescription": "Evaluate the efficiency and scalability of the researched algorithms, including time and space complexity analysis.",
      "complexity": null,
      "complexityReasoning": null,
      "configStrategy": "heuristic",
      "configDetails": {
        "base": {
          "model": "gpt-4o",
          "temperature": 0.6,
          "max_tokens": 1000
        },
        "tool": "openhands"
      },
      "workerTool": null,
      "result": null,
      "errorMessage": null,
      "subtasks": [],
      "childrenCount": 0,
      "depth": 5
    },
    "style": {
      "background": "#eab308",
      "color": "white",
      "border": "none",
      "borderRadius": "8px",
      "padding": "10px",
      "fontSize": "11px",
      "width": 200,
      "cursor": "pointer"
    }
  },
  {
    "id": "49eeba2c-d728-4d7e-812e-a470b0ad8bed",
    "position": {
      "x": 10875.0,
      "y": 720
    },
    "data": {
      "label": "MANAGER (waiting)\nAnalyze existing algorithms for ...",
      "role": "manager",
      "status": "waiting",
      "taskDescription": "Analyze existing algorithms for counting files in large directories and evaluate their efficiency and scalability.",
      "complexity": "complex",
      "complexityReasoning": "The task involves analyzing existing algorithms, which requires research and evaluation of their efficiency and scalability. This indicates multiple distinct subtasks and potential dependencies, making it complex rather than a straightforward execution.",
      "configStrategy": "heuristic",
      "configDetails": {
        "base": {
          "model": "gpt-4o-mini",
          "temperature": 0.4,
          "max_tokens": 1000
        },
        "tool": "openhands"
      },
      "workerTool": null,
      "result": null,
      "errorMessage": null,
      "subtasks": [
        {
          "description": "Research existing algorithms for counting files in large directories and summarize their methodologies and approaches.",
          "child_id": "6bfaea4b-be4d-49c3-98ac-5933f1e2d405",
          "child_status": "analyzing"
        },
        {
          "description": "Evaluate the efficiency and scalability of the researched algorithms, including time and space complexity analysis.",
          "child_id": "70229716-1ccd-42c0-9341-bc25b57350ff",
          "child_status": "analyzing"
        }
      ],
      "childrenCount": 2,
      "depth": 4
    },
    "style": {
      "background": "#2563eb",
      "color": "white",
      "border": "none",
      "borderRadius": "8px",
      "padding": "10px",
      "fontSize": "11px",
      "width": 200,
      "cursor": "pointer"
    }
  },
  {
    "id": "7ce8945b-00c1-4c8c-b4a1-ec4530b67ca4",
    "position": {
      "x": 11250,
      "y": 900
    },
    "data": {
      "label": "PENDING (analyzing)\nAnalyze current file counting me...",
      "role": "pending",
      "status": "analyzing",
      "taskDescription": "Analyze current file counting methods and identify bottlenecks in performance for large directories.",
      "complexity": null,
      "complexityReasoning": null,
      "configStrategy": "per_operation",
      "configDetails": {
        "complexity_evaluation": {
          "model": "gpt-4o-mini",
          "temperature": 0.3,
          "max_tokens": 500
        },
        "task_decomposition": {
          "model": "gpt-4o",
          "temperature": 0.7,
          "max_tokens": 1500
        },
        "tool": "openhands"
      },
      "workerTool": null,
      "result": null,
      "errorMessage": null,
      "subtasks": [],
      "childrenCount": 0,
      "depth": 5
    },
    "style": {
      "background": "#eab308",
      "color": "white",
      "border": "none",
      "borderRadius": "8px",
      "padding": "10px",
      "fontSize": "11px",
      "width": 200,
      "cursor": "pointer"
    }
  },
  {
    "id": "a7ac3c40-d160-461b-9541-ca2cf4fdaf42",
    "position": {
      "x": 11500,
      "y": 900
    },
    "data": {
      "label": "MANAGER (analyzing)\nResearch and evaluate potential ...",
      "role": "manager",
      "status": "analyzing",
      "taskDescription": "Research and evaluate potential optimization strategies such as parallel processing or indexing to improve file counting.",
      "complexity": "complex",
      "complexityReasoning": "The task involves research and evaluation of optimization strategies, which requires exploration before execution. It may involve multiple subtasks such as analyzing parallel processing and indexing, and potentially needs architectural decisions.",
      "configStrategy": "heuristic",
      "configDetails": {
        "base": {
          "model": "gpt-4o",
          "temperature": 0.6,
          "max_tokens": 1000
        },
        "tool": "openhands"
      },
      "workerTool": null,
      "result": null,
      "errorMessage": null,
      "subtasks": [],
      "childrenCount": 0,
      "depth": 5
    },
    "style": {
      "background": "#2563eb",
      "color": "white",
      "border": "none",
      "borderRadius": "8px",
      "padding": "10px",
      "fontSize": "11px",
      "width": 200,
      "cursor": "pointer"
    }
  },
  {
    "id": "e88191e5-62ce-4524-8228-8c38ed8d5b9a",
    "position": {
      "x": 11375.0,
      "y": 720
    },
    "data": {
      "label": "MANAGER (waiting)\nPropose optimization strategies ...",
      "role": "manager",
      "status": "waiting",
      "taskDescription": "Propose optimization strategies to improve file counting performance in large directories based on the analysis conducted.",
      "complexity": "complex",
      "complexityReasoning": "The task involves proposing optimization strategies, which requires research and analysis of performance issues, potentially spanning multiple domains and systems. This indicates multiple subtasks with dependencies and the need for architectural considerations.",
      "configStrategy": "heuristic",
      "configDetails": {
        "base": {
          "model": "gpt-4o-mini",
          "temperature": 0.6,
          "max_tokens": 700
        },
        "tool": "openhands"
      },
      "workerTool": null,
      "result": null,
      "errorMessage": null,
      "subtasks": [
        {
          "description": "Analyze current file counting methods and identify bottlenecks in performance for large directories.",
          "child_id": "7ce8945b-00c1-4c8c-b4a1-ec4530b67ca4",
          "child_status": "analyzing"
        },
        {
          "description": "Research and evaluate potential optimization strategies such as parallel processing or indexing to improve file counting.",
          "child_id": "a7ac3c40-d160-461b-9541-ca2cf4fdaf42",
          "child_status": "analyzing"
        }
      ],
      "childrenCount": 2,
      "depth": 4
    },
    "style": {
      "background": "#2563eb",
      "color": "white",
      "border": "none",
      "borderRadius": "8px",
      "padding": "10px",
      "fontSize": "11px",
      "width": 200,
      "cursor": "pointer"
    }
  },
  {
    "id": "70c749db-0064-4f67-8128-8f82e9d650e6",
    "position": {
      "x": 10875.0,
      "y": 540
    },
    "data": {
      "label": "MANAGER (waiting)\nAnalyze and document the challen...",
      "role": "manager",
      "status": "waiting",
      "taskDescription": "Analyze and document the challenges of counting files in large directories, including performance issues and time complexity.",
      "complexity": "complex",
      "complexityReasoning": "The task involves analyzing and documenting challenges, which requires research into performance issues and time complexity. This suggests multiple subtasks and potential dependencies, indicating a need for decomposition.",
      "configStrategy": "per_operation",
      "configDetails": {
        "complexity_evaluation": {
          "model": "gpt-4o-mini",
          "temperature": 0.3,
          "max_tokens": 300
        },
        "task_decomposition": {
          "model": "gpt-4o",
          "temperature": 0.7,
          "max_tokens": 1500
        },
        "tool": "openhands"
      },
      "workerTool": null,
      "result": null,
      "errorMessage": null,
      "subtasks": [
        {
          "description": "Research and document the performance issues associated with counting files in large directories, including time complexity considerations.",
          "child_id": "21fbb5db-c88e-4593-a749-f7d3055f4df7",
          "child_status": "waiting"
        },
        {
          "description": "Analyze existing algorithms for counting files in large directories and evaluate their efficiency and scalability.",
          "child_id": "49eeba2c-d728-4d7e-812e-a470b0ad8bed",
          "child_status": "waiting"
        },
        {
          "description": "Propose optimization strategies to improve file counting performance in large directories based on the analysis conducted.",
          "child_id": "e88191e5-62ce-4524-8228-8c38ed8d5b9a",
          "child_status": "waiting"
        }
      ],
      "childrenCount": 3,
      "depth": 3
    },
    "style": {
      "background": "#2563eb",
      "color": "white",
      "border": "none",
      "borderRadius": "8px",
      "padding": "10px",
      "fontSize": "11px",
      "width": 200,
      "cursor": "pointer"
    }
  },
  {
    "id": "2a411bf2-d516-4395-93ef-b37ab271e70e",
    "position": {
      "x": 9250.0,
      "y": 360
    },
    "data": {
      "label": "MANAGER (waiting)\nIdentify and document edge cases...",
      "role": "manager",
      "status": "waiting",
      "taskDescription": "Identify and document edge cases for file counting, such as handling of symbolic links, permission errors, and large directories.",
      "complexity": "complex",
      "complexityReasoning": "The task involves identifying and documenting edge cases, which requires research into various scenarios like symbolic links and permission errors. It also has multiple subtasks with dependencies, as each edge case may need separate handling and consideration, indicating a need for decomposition.",
      "configStrategy": "heuristic",
      "configDetails": {
        "base": {
          "model": "gpt-4o-mini",
          "temperature": 0.3,
          "max_tokens": 500
        },
        "tool": "openhands"
      },
      "workerTool": null,
      "result": null,
      "errorMessage": null,
      "subtasks": [
        {
          "description": "Identify and document edge cases related to symbolic links in file counting, including how they are counted and any potential pitfalls.",
          "child_id": "4257b335-15ce-4d9f-bae9-cc62911c2283",
          "child_status": "waiting"
        },
        {
          "description": "Research and document how permission errors affect file counting, including scenarios where access is denied.",
          "child_id": "4ec0f67d-459b-4e64-bdbe-03b976bb1729",
          "child_status": "waiting"
        },
        {
          "description": "Analyze and document the challenges of counting files in large directories, including performance issues and time complexity.",
          "child_id": "70c749db-0064-4f67-8128-8f82e9d650e6",
          "child_status": "waiting"
        }
      ],
      "childrenCount": 3,
      "depth": 2
    },
    "style": {
      "background": "#2563eb",
      "color": "white",
      "border": "none",
      "borderRadius": "8px",
      "padding": "10px",
      "fontSize": "11px",
      "width": 200,
      "cursor": "pointer"
    }
  },
  {
    "id": "fb436ae0-6cc9-4ddb-86e3-0997abb662f4",
    "position": {
      "x": 9125.0,
      "y": 180
    },
    "data": {
      "label": "MANAGER (waiting)\nWrite unit tests for the C progr...",
      "role": "manager",
      "status": "waiting",
      "taskDescription": "Write unit tests for the C program to ensure accuracy in counting files, including edge cases like empty directories and permission issues.",
      "complexity": "complex",
      "complexityReasoning": "The task involves writing unit tests for a C program, which requires considering edge cases like empty directories and permission issues. This indicates multiple subtasks with dependencies, as well as the need for thorough testing strategies, making it complex.",
      "configStrategy": "heuristic",
      "configDetails": {
        "base": {
          "model": "gpt-4o-mini",
          "temperature": 0.4,
          "max_tokens": 800
        },
        "tool": "openhands"
      },
      "workerTool": null,
      "result": null,
      "errorMessage": null,
      "subtasks": [
        {
          "description": "Write unit tests for counting files in a directory, including tests for edge cases like empty directories and permission issues.",
          "child_id": "b391907b-dde4-4cfd-9b07-5f18910158bc",
          "child_status": "completed"
        },
        {
          "description": "Identify and document edge cases for file counting, such as handling of symbolic links, permission errors, and large directories.",
          "child_id": "2a411bf2-d516-4395-93ef-b37ab271e70e",
          "child_status": "waiting"
        }
      ],
      "childrenCount": 2,
      "depth": 1
    },
    "style": {
      "background": "#2563eb",
      "color": "white",
      "border": "none",
      "borderRadius": "8px",
      "padding": "10px",
      "fontSize": "11px",
      "width": 200,
      "cursor": "pointer"
    }
  },
  {
    "id": "12dad0e4-f455-4fc0-92e2-0c04644a92e1",
    "position": {
      "x": 5750.0,
      "y": 0
    },
    "data": {
      "label": "BOSS (waiting)\nwrite C code with only one file ...",
      "role": "boss",
      "status": "waiting",
      "taskDescription": "write C code with only one file that counts all files recursively in the current directory",
      "complexity": null,
      "complexityReasoning": null,
      "configStrategy": "heuristic",
      "configDetails": {
        "base": {
          "model": "gpt-4o-mini",
          "temperature": 0.7,
          "max_tokens": 1000
        },
        "tool": "claude_code"
      },
      "workerTool": null,
      "result": null,
      "errorMessage": null,
      "subtasks": [
        {
          "description": "Create a C program that traverses the current directory and counts all files recursively, ensuring to handle symlinks properly.",
          "child_id": "4243afcf-8d3b-44bc-9f1d-24f3b175326c",
          "child_status": "waiting"
        },
        {
          "description": "Write unit tests for the C program to ensure accuracy in counting files, including edge cases like empty directories and permission issues.",
          "child_id": "fb436ae0-6cc9-4ddb-86e3-0997abb662f4",
          "child_status": "waiting"
        }
      ],
      "childrenCount": 2,
      "depth": 0
    },
    "style": {
      "background": "#7c3aed",
      "color": "white",
      "border": "none",
      "borderRadius": "8px",
      "padding": "10px",
      "fontSize": "11px",
      "width": 200,
      "cursor": "pointer"
    }
  }
];

const initialEdges = [
  {
    "id": "e-12dad0e4-4243afcf",
    "source": "12dad0e4-f455-4fc0-92e2-0c04644a92e1",
    "target": "4243afcf-8d3b-44bc-9f1d-24f3b175326c",
    "type": "smoothstep"
  },
  {
    "id": "e-4243afcf-ecbeed6d",
    "source": "4243afcf-8d3b-44bc-9f1d-24f3b175326c",
    "target": "ecbeed6d-89ce-429e-bed0-98c527b94977",
    "type": "smoothstep"
  },
  {
    "id": "e-ecbeed6d-5d0f2fbd",
    "source": "ecbeed6d-89ce-429e-bed0-98c527b94977",
    "target": "5d0f2fbd-7bb9-4906-9b81-33a870cbd2b4",
    "type": "smoothstep"
  },
  {
    "id": "e-5d0f2fbd-71d06215",
    "source": "5d0f2fbd-7bb9-4906-9b81-33a870cbd2b4",
    "target": "71d06215-5768-4267-9b0b-331e7f1ce955",
    "type": "smoothstep"
  },
  {
    "id": "e-71d06215-eea8ccdf",
    "source": "71d06215-5768-4267-9b0b-331e7f1ce955",
    "target": "eea8ccdf-57da-4ae9-8632-295c26c382e7",
    "type": "smoothstep"
  },
  {
    "id": "e-71d06215-c1d62eb3",
    "source": "71d06215-5768-4267-9b0b-331e7f1ce955",
    "target": "c1d62eb3-c936-47f0-aa19-9e8c657a9845",
    "type": "smoothstep"
  },
  {
    "id": "e-5d0f2fbd-5a346d93",
    "source": "5d0f2fbd-7bb9-4906-9b81-33a870cbd2b4",
    "target": "5a346d93-5d9e-446c-a0c6-2478d656ae59",
    "type": "smoothstep"
  },
  {
    "id": "e-5a346d93-0218f558",
    "source": "5a346d93-5d9e-446c-a0c6-2478d656ae59",
    "target": "0218f558-7a15-4933-b69e-aae207dbedd7",
    "type": "smoothstep"
  },
  {
    "id": "e-5a346d93-9284afef",
    "source": "5a346d93-5d9e-446c-a0c6-2478d656ae59",
    "target": "9284afef-fdf1-4b98-9c24-bc7ab51fbdf8",
    "type": "smoothstep"
  },
  {
    "id": "e-5d0f2fbd-b8f82610",
    "source": "5d0f2fbd-7bb9-4906-9b81-33a870cbd2b4",
    "target": "b8f82610-a5ca-48b8-a9b0-2444463087cc",
    "type": "smoothstep"
  },
  {
    "id": "e-b8f82610-1ccc5797",
    "source": "b8f82610-a5ca-48b8-a9b0-2444463087cc",
    "target": "1ccc5797-afb2-48c7-a5c3-afc08f98aca4",
    "type": "smoothstep"
  },
  {
    "id": "e-b8f82610-7a5d11aa",
    "source": "b8f82610-a5ca-48b8-a9b0-2444463087cc",
    "target": "7a5d11aa-fe2d-4301-9725-7a417ec326fb",
    "type": "smoothstep"
  },
  {
    "id": "e-ecbeed6d-5deb2acf",
    "source": "ecbeed6d-89ce-429e-bed0-98c527b94977",
    "target": "5deb2acf-cb24-42cf-baed-c8c8f0a9eb46",
    "type": "smoothstep"
  },
  {
    "id": "e-5deb2acf-8241d5b9",
    "source": "5deb2acf-cb24-42cf-baed-c8c8f0a9eb46",
    "target": "8241d5b9-9c40-461f-a14e-6135e1f5bf9c",
    "type": "smoothstep"
  },
  {
    "id": "e-5deb2acf-070e4141",
    "source": "5deb2acf-cb24-42cf-baed-c8c8f0a9eb46",
    "target": "070e4141-6d3f-46ba-8bd0-5f61ce658bff",
    "type": "smoothstep"
  },
  {
    "id": "e-5deb2acf-7cf1198a",
    "source": "5deb2acf-cb24-42cf-baed-c8c8f0a9eb46",
    "target": "7cf1198a-57fc-4440-b391-cb29f9dfed67",
    "type": "smoothstep"
  },
  {
    "id": "e-4243afcf-e2564d1a",
    "source": "4243afcf-8d3b-44bc-9f1d-24f3b175326c",
    "target": "e2564d1a-69b7-4a15-a441-f5fcd9e68349",
    "type": "smoothstep"
  },
  {
    "id": "e-e2564d1a-e7514742",
    "source": "e2564d1a-69b7-4a15-a441-f5fcd9e68349",
    "target": "e7514742-56d0-46ff-bc11-e74c04cb38b6",
    "type": "smoothstep"
  },
  {
    "id": "e-e7514742-01e54318",
    "source": "e7514742-56d0-46ff-bc11-e74c04cb38b6",
    "target": "01e54318-abfd-4b40-aaa0-ae80d3f72b81",
    "type": "smoothstep"
  },
  {
    "id": "e-01e54318-8f9d34b7",
    "source": "01e54318-abfd-4b40-aaa0-ae80d3f72b81",
    "target": "8f9d34b7-5b0c-4527-b2b6-92be4a23d783",
    "type": "smoothstep"
  },
  {
    "id": "e-01e54318-f1b75cd2",
    "source": "01e54318-abfd-4b40-aaa0-ae80d3f72b81",
    "target": "f1b75cd2-5781-4e1a-96e0-e788a58679a0",
    "type": "smoothstep"
  },
  {
    "id": "e-e7514742-3f526896",
    "source": "e7514742-56d0-46ff-bc11-e74c04cb38b6",
    "target": "3f526896-d52b-498b-b66d-d5520f38055a",
    "type": "smoothstep"
  },
  {
    "id": "e-3f526896-8f4232e6",
    "source": "3f526896-d52b-498b-b66d-d5520f38055a",
    "target": "8f4232e6-19f4-4f1a-a77a-848f27c923f8",
    "type": "smoothstep"
  },
  {
    "id": "e-3f526896-a0f9f182",
    "source": "3f526896-d52b-498b-b66d-d5520f38055a",
    "target": "a0f9f182-9404-40de-b835-85139a2afcac",
    "type": "smoothstep"
  },
  {
    "id": "e-e7514742-6e30ae1b",
    "source": "e7514742-56d0-46ff-bc11-e74c04cb38b6",
    "target": "6e30ae1b-b102-4e65-93f9-9b66c6999117",
    "type": "smoothstep"
  },
  {
    "id": "e-6e30ae1b-8877dde7",
    "source": "6e30ae1b-b102-4e65-93f9-9b66c6999117",
    "target": "8877dde7-2066-40e1-943b-d0ede42bbfaf",
    "type": "smoothstep"
  },
  {
    "id": "e-6e30ae1b-60dcd441",
    "source": "6e30ae1b-b102-4e65-93f9-9b66c6999117",
    "target": "60dcd441-f93e-4507-bbe2-a626637c68f7",
    "type": "smoothstep"
  },
  {
    "id": "e-e2564d1a-e46af355",
    "source": "e2564d1a-69b7-4a15-a441-f5fcd9e68349",
    "target": "e46af355-802d-4215-98b3-5eedf9865042",
    "type": "smoothstep"
  },
  {
    "id": "e-4243afcf-76bc175d",
    "source": "4243afcf-8d3b-44bc-9f1d-24f3b175326c",
    "target": "76bc175d-c8e2-4c40-8813-9c0c551f9561",
    "type": "smoothstep"
  },
  {
    "id": "e-76bc175d-0f975760",
    "source": "76bc175d-c8e2-4c40-8813-9c0c551f9561",
    "target": "0f975760-5fab-4b57-89a9-8d90ce902e78",
    "type": "smoothstep"
  },
  {
    "id": "e-0f975760-9f976938",
    "source": "0f975760-5fab-4b57-89a9-8d90ce902e78",
    "target": "9f976938-0a49-449a-937a-6d94ac71cb27",
    "type": "smoothstep"
  },
  {
    "id": "e-0f975760-76932a27",
    "source": "0f975760-5fab-4b57-89a9-8d90ce902e78",
    "target": "76932a27-3c7a-4d25-9f10-5cba2a2f71e4",
    "type": "smoothstep"
  },
  {
    "id": "e-76932a27-1876c57b",
    "source": "76932a27-3c7a-4d25-9f10-5cba2a2f71e4",
    "target": "1876c57b-b34c-40ed-a852-4bd5dc15b8b7",
    "type": "smoothstep"
  },
  {
    "id": "e-76932a27-d97fb941",
    "source": "76932a27-3c7a-4d25-9f10-5cba2a2f71e4",
    "target": "d97fb941-dc53-40e8-af2e-5bc80583d917",
    "type": "smoothstep"
  },
  {
    "id": "e-76932a27-11204d9e",
    "source": "76932a27-3c7a-4d25-9f10-5cba2a2f71e4",
    "target": "11204d9e-6453-4adf-86a7-a1aaeae2cd1e",
    "type": "smoothstep"
  },
  {
    "id": "e-0f975760-c7ba6168",
    "source": "0f975760-5fab-4b57-89a9-8d90ce902e78",
    "target": "c7ba6168-631e-4a4c-89f1-4132cf4fcaa9",
    "type": "smoothstep"
  },
  {
    "id": "e-76bc175d-7f255488",
    "source": "76bc175d-c8e2-4c40-8813-9c0c551f9561",
    "target": "7f255488-2522-4a71-98ff-d409e659f35c",
    "type": "smoothstep"
  },
  {
    "id": "e-7f255488-557d2597",
    "source": "7f255488-2522-4a71-98ff-d409e659f35c",
    "target": "557d2597-3990-42ca-b4ef-45900e48fd09",
    "type": "smoothstep"
  },
  {
    "id": "e-557d2597-f4b76abc",
    "source": "557d2597-3990-42ca-b4ef-45900e48fd09",
    "target": "f4b76abc-a0d1-4e21-b95c-1f8baf386163",
    "type": "smoothstep"
  },
  {
    "id": "e-557d2597-afd538d5",
    "source": "557d2597-3990-42ca-b4ef-45900e48fd09",
    "target": "afd538d5-88a1-4c9a-a6b5-5982585f448b",
    "type": "smoothstep"
  },
  {
    "id": "e-7f255488-2ace6cc4",
    "source": "7f255488-2522-4a71-98ff-d409e659f35c",
    "target": "2ace6cc4-7583-4922-8237-120ea2a9c299",
    "type": "smoothstep"
  },
  {
    "id": "e-2ace6cc4-b571efd5",
    "source": "2ace6cc4-7583-4922-8237-120ea2a9c299",
    "target": "b571efd5-663a-4e2e-8385-00a8f9311102",
    "type": "smoothstep"
  },
  {
    "id": "e-2ace6cc4-0faff1b0",
    "source": "2ace6cc4-7583-4922-8237-120ea2a9c299",
    "target": "0faff1b0-dc05-454e-9033-b040e387580d",
    "type": "smoothstep"
  },
  {
    "id": "e-7f255488-d293fb47",
    "source": "7f255488-2522-4a71-98ff-d409e659f35c",
    "target": "d293fb47-42f1-4301-8b32-d62657ea022f",
    "type": "smoothstep"
  },
  {
    "id": "e-d293fb47-e2c5617c",
    "source": "d293fb47-42f1-4301-8b32-d62657ea022f",
    "target": "e2c5617c-a1d3-4848-bd93-0fa2a05917fc",
    "type": "smoothstep"
  },
  {
    "id": "e-d293fb47-da16b404",
    "source": "d293fb47-42f1-4301-8b32-d62657ea022f",
    "target": "da16b404-9d8d-435d-a151-6bd9e55e45ef",
    "type": "smoothstep"
  },
  {
    "id": "e-12dad0e4-fb436ae0",
    "source": "12dad0e4-f455-4fc0-92e2-0c04644a92e1",
    "target": "fb436ae0-6cc9-4ddb-86e3-0997abb662f4",
    "type": "smoothstep"
  },
  {
    "id": "e-fb436ae0-b391907b",
    "source": "fb436ae0-6cc9-4ddb-86e3-0997abb662f4",
    "target": "b391907b-dde4-4cfd-9b07-5f18910158bc",
    "type": "smoothstep"
  },
  {
    "id": "e-fb436ae0-2a411bf2",
    "source": "fb436ae0-6cc9-4ddb-86e3-0997abb662f4",
    "target": "2a411bf2-d516-4395-93ef-b37ab271e70e",
    "type": "smoothstep"
  },
  {
    "id": "e-2a411bf2-4257b335",
    "source": "2a411bf2-d516-4395-93ef-b37ab271e70e",
    "target": "4257b335-15ce-4d9f-bae9-cc62911c2283",
    "type": "smoothstep"
  },
  {
    "id": "e-4257b335-de8c233a",
    "source": "4257b335-15ce-4d9f-bae9-cc62911c2283",
    "target": "de8c233a-1394-4ddc-8922-0923281b5906",
    "type": "smoothstep"
  },
  {
    "id": "e-de8c233a-334d055d",
    "source": "de8c233a-1394-4ddc-8922-0923281b5906",
    "target": "334d055d-b9e9-4246-85ca-723cc9461952",
    "type": "smoothstep"
  },
  {
    "id": "e-de8c233a-5319343c",
    "source": "de8c233a-1394-4ddc-8922-0923281b5906",
    "target": "5319343c-2f18-4a84-8dea-2357c7802fa8",
    "type": "smoothstep"
  },
  {
    "id": "e-4257b335-a9c46963",
    "source": "4257b335-15ce-4d9f-bae9-cc62911c2283",
    "target": "a9c46963-bbf7-4593-ad0c-e21c8458ec31",
    "type": "smoothstep"
  },
  {
    "id": "e-a9c46963-06e89123",
    "source": "a9c46963-bbf7-4593-ad0c-e21c8458ec31",
    "target": "06e89123-13f4-4fa3-83ca-ba3c74eaa469",
    "type": "smoothstep"
  },
  {
    "id": "e-a9c46963-421f7f89",
    "source": "a9c46963-bbf7-4593-ad0c-e21c8458ec31",
    "target": "421f7f89-73dd-4d1b-adb4-9f5454f8c827",
    "type": "smoothstep"
  },
  {
    "id": "e-4257b335-2009a517",
    "source": "4257b335-15ce-4d9f-bae9-cc62911c2283",
    "target": "2009a517-a527-40a7-ad9e-02eaf4b2b6cf",
    "type": "smoothstep"
  },
  {
    "id": "e-2009a517-bb7385c9",
    "source": "2009a517-a527-40a7-ad9e-02eaf4b2b6cf",
    "target": "bb7385c9-5a65-4fb6-b00c-a6f3e75103c2",
    "type": "smoothstep"
  },
  {
    "id": "e-2009a517-533343f4",
    "source": "2009a517-a527-40a7-ad9e-02eaf4b2b6cf",
    "target": "533343f4-33b1-4c7e-966a-7c731c88b1fc",
    "type": "smoothstep"
  },
  {
    "id": "e-2009a517-7a4ab8b4",
    "source": "2009a517-a527-40a7-ad9e-02eaf4b2b6cf",
    "target": "7a4ab8b4-f8d0-41f4-8888-7de4224182e4",
    "type": "smoothstep"
  },
  {
    "id": "e-2a411bf2-4ec0f67d",
    "source": "2a411bf2-d516-4395-93ef-b37ab271e70e",
    "target": "4ec0f67d-459b-4e64-bdbe-03b976bb1729",
    "type": "smoothstep"
  },
  {
    "id": "e-4ec0f67d-3c731d3e",
    "source": "4ec0f67d-459b-4e64-bdbe-03b976bb1729",
    "target": "3c731d3e-b803-4e29-8f04-cf3d98f607b4",
    "type": "smoothstep"
  },
  {
    "id": "e-3c731d3e-1818ba8a",
    "source": "3c731d3e-b803-4e29-8f04-cf3d98f607b4",
    "target": "1818ba8a-0ece-41f5-a581-d00f6d11ee0b",
    "type": "smoothstep"
  },
  {
    "id": "e-3c731d3e-ee96d106",
    "source": "3c731d3e-b803-4e29-8f04-cf3d98f607b4",
    "target": "ee96d106-52d9-4b24-9a4e-62fc04487311",
    "type": "smoothstep"
  },
  {
    "id": "e-4ec0f67d-7a651bc1",
    "source": "4ec0f67d-459b-4e64-bdbe-03b976bb1729",
    "target": "7a651bc1-5044-43c5-949e-508653376e9a",
    "type": "smoothstep"
  },
  {
    "id": "e-7a651bc1-3f9d1dd3",
    "source": "7a651bc1-5044-43c5-949e-508653376e9a",
    "target": "3f9d1dd3-d7a9-4932-9aea-c9e063d33c6f",
    "type": "smoothstep"
  },
  {
    "id": "e-7a651bc1-64824aec",
    "source": "7a651bc1-5044-43c5-949e-508653376e9a",
    "target": "64824aec-1a74-4da8-8018-79e166e25dbd",
    "type": "smoothstep"
  },
  {
    "id": "e-4ec0f67d-8275041a",
    "source": "4ec0f67d-459b-4e64-bdbe-03b976bb1729",
    "target": "8275041a-d417-4969-ad7f-8daa463fa6f6",
    "type": "smoothstep"
  },
  {
    "id": "e-8275041a-257897b0",
    "source": "8275041a-d417-4969-ad7f-8daa463fa6f6",
    "target": "257897b0-e025-4a56-9347-a344955d7114",
    "type": "smoothstep"
  },
  {
    "id": "e-8275041a-792271dc",
    "source": "8275041a-d417-4969-ad7f-8daa463fa6f6",
    "target": "792271dc-19cd-4a5b-b637-2f1329fca1cd",
    "type": "smoothstep"
  },
  {
    "id": "e-2a411bf2-70c749db",
    "source": "2a411bf2-d516-4395-93ef-b37ab271e70e",
    "target": "70c749db-0064-4f67-8128-8f82e9d650e6",
    "type": "smoothstep"
  },
  {
    "id": "e-70c749db-21fbb5db",
    "source": "70c749db-0064-4f67-8128-8f82e9d650e6",
    "target": "21fbb5db-c88e-4593-a749-f7d3055f4df7",
    "type": "smoothstep"
  },
  {
    "id": "e-21fbb5db-ad2ede90",
    "source": "21fbb5db-c88e-4593-a749-f7d3055f4df7",
    "target": "ad2ede90-58b0-4039-a6de-77c62ea26590",
    "type": "smoothstep"
  },
  {
    "id": "e-21fbb5db-bc6c6196",
    "source": "21fbb5db-c88e-4593-a749-f7d3055f4df7",
    "target": "bc6c6196-e686-4d08-bf8d-79a6e5f72b70",
    "type": "smoothstep"
  },
  {
    "id": "e-70c749db-49eeba2c",
    "source": "70c749db-0064-4f67-8128-8f82e9d650e6",
    "target": "49eeba2c-d728-4d7e-812e-a470b0ad8bed",
    "type": "smoothstep"
  },
  {
    "id": "e-49eeba2c-6bfaea4b",
    "source": "49eeba2c-d728-4d7e-812e-a470b0ad8bed",
    "target": "6bfaea4b-be4d-49c3-98ac-5933f1e2d405",
    "type": "smoothstep"
  },
  {
    "id": "e-49eeba2c-70229716",
    "source": "49eeba2c-d728-4d7e-812e-a470b0ad8bed",
    "target": "70229716-1ccd-42c0-9341-bc25b57350ff",
    "type": "smoothstep"
  },
  {
    "id": "e-70c749db-e88191e5",
    "source": "70c749db-0064-4f67-8128-8f82e9d650e6",
    "target": "e88191e5-62ce-4524-8228-8c38ed8d5b9a",
    "type": "smoothstep"
  },
  {
    "id": "e-e88191e5-7ce8945b",
    "source": "e88191e5-62ce-4524-8228-8c38ed8d5b9a",
    "target": "7ce8945b-00c1-4c8c-b4a1-ec4530b67ca4",
    "type": "smoothstep"
  },
  {
    "id": "e-e88191e5-a7ac3c40",
    "source": "e88191e5-62ce-4524-8228-8c38ed8d5b9a",
    "target": "a7ac3c40-d160-461b-9541-ca2cf4fdaf42",
    "type": "smoothstep"
  }
];

export default function ReactFlowTree() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedAgent, setSelectedAgent] = useState(null);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onNodeClick = useCallback((event, node) => {
    setSelectedAgent(node.data);
  }, []);

  const closeModal = useCallback(() => {
    setSelectedAgent(null);
  }, []);

  // MiniMap node color based on style background
  const minimapNodeColor = (node) => node.style?.background || '#6b7280';

  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.1}
        maxZoom={2}
      >
        <MiniMap nodeColor={minimapNodeColor} zoomable pannable />
        <Controls />
        <Background variant="dots" gap={12} size={1} />
      </ReactFlow>
      <AgentModal agent={selectedAgent} onClose={closeModal} />
    </div>
  );
}