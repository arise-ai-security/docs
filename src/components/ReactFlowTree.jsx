import React, { useCallback } from 'react';
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

const initialNodes = [
  {
    "id": "eea8ccdf-57da-4ae9-8632-295c26c382e7",
    "position": {
      "x": 0,
      "y": 900
    },
    "data": {
      "label": "MANAGER (analyzing)\nResearch existing C libraries th..."
    },
    "style": {
      "background": "#2563eb",
      "color": "white",
      "border": "none",
      "borderRadius": "8px",
      "padding": "10px",
      "fontSize": "11px",
      "width": 200
    }
  },
  {
    "id": "c1d62eb3-c936-47f0-aa19-9e8c657a9845",
    "position": {
      "x": 250,
      "y": 900
    },
    "data": {
      "label": "PENDING (analyzing)\nCompile a list of features and l..."
    },
    "style": {
      "background": "#eab308",
      "color": "white",
      "border": "none",
      "borderRadius": "8px",
      "padding": "10px",
      "fontSize": "11px",
      "width": 200
    }
  },
  {
    "id": "71d06215-5768-4267-9b0b-331e7f1ce955",
    "position": {
      "x": 125.0,
      "y": 720
    },
    "data": {
      "label": "MANAGER (waiting)\nResearch existing C libraries fo..."
    },
    "style": {
      "background": "#2563eb",
      "color": "white",
      "border": "none",
      "borderRadius": "8px",
      "padding": "10px",
      "fontSize": "11px",
      "width": 200
    }
  },
  {
    "id": "0218f558-7a15-4933-b69e-aae207dbedd7",
    "position": {
      "x": 500,
      "y": 900
    },
    "data": {
      "label": "PENDING (analyzing)\nEvaluate the pros and cons of th..."
    },
    "style": {
      "background": "#eab308",
      "color": "white",
      "border": "none",
      "borderRadius": "8px",
      "padding": "10px",
      "fontSize": "11px",
      "width": 200
    }
  },
  {
    "id": "9284afef-fdf1-4b98-9c24-bc7ab51fbdf8",
    "position": {
      "x": 750,
      "y": 900
    },
    "data": {
      "label": "PENDING (analyzing)\nEvaluate the pros and cons of th..."
    },
    "style": {
      "background": "#eab308",
      "color": "white",
      "border": "none",
      "borderRadius": "8px",
      "padding": "10px",
      "fontSize": "11px",
      "width": 200
    }
  },
  {
    "id": "5a346d93-5d9e-446c-a0c6-2478d656ae59",
    "position": {
      "x": 625.0,
      "y": 720
    },
    "data": {
      "label": "MANAGER (waiting)\nEvaluate the pros and cons of sh..."
    },
    "style": {
      "background": "#2563eb",
      "color": "white",
      "border": "none",
      "borderRadius": "8px",
      "padding": "10px",
      "fontSize": "11px",
      "width": 200
    }
  },
  {
    "id": "1ccc5797-afb2-48c7-a5c3-afc08f98aca4",
    "position": {
      "x": 1000,
      "y": 900
    },
    "data": {
      "label": "PENDING (analyzing)\nResearch and evaluate potential ..."
    },
    "style": {
      "background": "#eab308",
      "color": "white",
      "border": "none",
      "borderRadius": "8px",
      "padding": "10px",
      "fontSize": "11px",
      "width": 200
    }
  },
  {
    "id": "7a5d11aa-fe2d-4301-9725-7a417ec326fb",
    "position": {
      "x": 1250,
      "y": 900
    },
    "data": {
      "label": "PENDING (analyzing)\nCompile the findings into a stru..."
    },
    "style": {
      "background": "#eab308",
      "color": "white",
      "border": "none",
      "borderRadius": "8px",
      "padding": "10px",
      "fontSize": "11px",
      "width": 200
    }
  },
  {
    "id": "b8f82610-a5ca-48b8-a9b0-2444463087cc",
    "position": {
      "x": 1125.0,
      "y": 720
    },
    "data": {
      "label": "MANAGER (waiting)\nCompile a recommendation report ..."
    },
    "style": {
      "background": "#2563eb",
      "color": "white",
      "border": "none",
      "borderRadius": "8px",
      "padding": "10px",
      "fontSize": "11px",
      "width": 200
    }
  },
  {
    "id": "5d0f2fbd-7bb9-4906-9b81-33a870cbd2b4",
    "position": {
      "x": 625.0,
      "y": 540
    },
    "data": {
      "label": "MANAGER (waiting)\nResearch and select appropriate ..."
    },
    "style": {
      "background": "#2563eb",
      "color": "white",
      "border": "none",
      "borderRadius": "8px",
      "padding": "10px",
      "fontSize": "11px",
      "width": 200
    }
  },
  {
    "id": "8241d5b9-9c40-461f-a14e-6135e1f5bf9c",
    "position": {
      "x": 1500,
      "y": 720
    },
    "data": {
      "label": "WORKER (completed)\nDevelop a C program to traverse ..."
    },
    "style": {
      "background": "#16a34a",
      "color": "white",
      "border": "none",
      "borderRadius": "8px",
      "padding": "10px",
      "fontSize": "11px",
      "width": 200
    }
  },
  {
    "id": "070e4141-6d3f-46ba-8bd0-5f61ce658bff",
    "position": {
      "x": 1750,
      "y": 720
    },
    "data": {
      "label": "WORKER (completed)\nEnhance the C program to handle ..."
    },
    "style": {
      "background": "#16a34a",
      "color": "white",
      "border": "none",
      "borderRadius": "8px",
      "padding": "10px",
      "fontSize": "11px",
      "width": 200
    }
  },
  {
    "id": "7cf1198a-57fc-4440-b391-cb29f9dfed67",
    "position": {
      "x": 2000,
      "y": 720
    },
    "data": {
      "label": "WORKER (completed)\nTest the C program to ensure it ..."
    },
    "style": {
      "background": "#16a34a",
      "color": "white",
      "border": "none",
      "borderRadius": "8px",
      "padding": "10px",
      "fontSize": "11px",
      "width": 200
    }
  },
  {
    "id": "5deb2acf-cb24-42cf-baed-c8c8f0a9eb46",
    "position": {
      "x": 1750.0,
      "y": 540
    },
    "data": {
      "label": "MANAGER (completed)\nImplement the C program to trave..."
    },
    "style": {
      "background": "#2563eb",
      "color": "white",
      "border": "none",
      "borderRadius": "8px",
      "padding": "10px",
      "fontSize": "11px",
      "width": 200
    }
  },
  {
    "id": "ecbeed6d-89ce-429e-bed0-98c527b94977",
    "position": {
      "x": 1000.0,
      "y": 360
    },
    "data": {
      "label": "MANAGER (waiting)\nDevelop a C program to traverse ..."
    },
    "style": {
      "background": "#2563eb",
      "color": "white",
      "border": "none",
      "borderRadius": "8px",
      "padding": "10px",
      "fontSize": "11px",
      "width": 200
    }
  },
  {
    "id": "8f9d34b7-5b0c-4527-b2b6-92be4a23d783",
    "position": {
      "x": 2250,
      "y": 900
    },
    "data": {
      "label": "PENDING (analyzing)\nResearch efficient methods for c..."
    },
    "style": {
      "background": "#eab308",
      "color": "white",
      "border": "none",
      "borderRadius": "8px",
      "padding": "10px",
      "fontSize": "11px",
      "width": 200
    }
  },
  {
    "id": "f1b75cd2-5781-4e1a-96e0-e788a58679a0",
    "position": {
      "x": 2500,
      "y": 900
    },
    "data": {
      "label": "PENDING (analyzing)\nIdentify and document potential ..."
    },
    "style": {
      "background": "#eab308",
      "color": "white",
      "border": "none",
      "borderRadius": "8px",
      "padding": "10px",
      "fontSize": "11px",
      "width": 200
    }
  },
  {
    "id": "01e54318-abfd-4b40-aaa0-ae80d3f72b81",
    "position": {
      "x": 2375.0,
      "y": 720
    },
    "data": {
      "label": "MANAGER (waiting)\nResearch best practices for coun..."
    },
    "style": {
      "background": "#2563eb",
      "color": "white",
      "border": "none",
      "borderRadius": "8px",
      "padding": "10px",
      "fontSize": "11px",
      "width": 200
    }
  },
  {
    "id": "8f4232e6-19f4-4f1a-a77a-848f27c923f8",
    "position": {
      "x": 2750,
      "y": 900
    },
    "data": {
      "label": "PENDING (analyzing)\nResearch methods to identify and..."
    },
    "style": {
      "background": "#eab308",
      "color": "white",
      "border": "none",
      "borderRadius": "8px",
      "padding": "10px",
      "fontSize": "11px",
      "width": 200
    }
  },
  {
    "id": "a0f9f182-9404-40de-b835-85139a2afcac",
    "position": {
      "x": 3000,
      "y": 900
    },
    "data": {
      "label": "PENDING (analyzing)\nDocument findings and propose a ..."
    },
    "style": {
      "background": "#eab308",
      "color": "white",
      "border": "none",
      "borderRadius": "8px",
      "padding": "10px",
      "fontSize": "11px",
      "width": 200
    }
  },
  {
    "id": "3f526896-d52b-498b-b66d-d5520f38055a",
    "position": {
      "x": 2875.0,
      "y": 720
    },
    "data": {
      "label": "MANAGER (waiting)\nAnalyze strategies to avoid dupl..."
    },
    "style": {
      "background": "#2563eb",
      "color": "white",
      "border": "none",
      "borderRadius": "8px",
      "padding": "10px",
      "fontSize": "11px",
      "width": 200
    }
  },
  {
    "id": "8877dde7-2066-40e1-943b-d0ede42bbfaf",
    "position": {
      "x": 3250,
      "y": 900
    },
    "data": {
      "label": "PENDING (analyzing)\nCompile and organize the key fin..."
    },
    "style": {
      "background": "#eab308",
      "color": "white",
      "border": "none",
      "borderRadius": "8px",
      "padding": "10px",
      "fontSize": "11px",
      "width": 200
    }
  },
  {
    "id": "60dcd441-f93e-4507-bbe2-a626637c68f7",
    "position": {
      "x": 3500,
      "y": 900
    },
    "data": {
      "label": "PENDING (analyzing)\nDraft detailed sections of the g..."
    },
    "style": {
      "background": "#eab308",
      "color": "white",
      "border": "none",
      "borderRadius": "8px",
      "padding": "10px",
      "fontSize": "11px",
      "width": 200
    }
  },
  {
    "id": "6e30ae1b-b102-4e65-93f9-9b66c6999117",
    "position": {
      "x": 3375.0,
      "y": 720
    },
    "data": {
      "label": "MANAGER (waiting)\nSummarize research findings into..."
    },
    "style": {
      "background": "#2563eb",
      "color": "white",
      "border": "none",
      "borderRadius": "8px",
      "padding": "10px",
      "fontSize": "11px",
      "width": 200
    }
  },
  {
    "id": "e7514742-56d0-46ff-bc11-e74c04cb38b6",
    "position": {
      "x": 2875.0,
      "y": 540
    },
    "data": {
      "label": "MANAGER (waiting)\nResearch the best practices for ..."
    },
    "style": {
      "background": "#2563eb",
      "color": "white",
      "border": "none",
      "borderRadius": "8px",
      "padding": "10px",
      "fontSize": "11px",
      "width": 200
    }
  },
  {
    "id": "e46af355-802d-4215-98b3-5eedf9865042",
    "position": {
      "x": 3750,
      "y": 540
    },
    "data": {
      "label": "WORKER (completed)\nImplement the logic in C to coun..."
    },
    "style": {
      "background": "#16a34a",
      "color": "white",
      "border": "none",
      "borderRadius": "8px",
      "padding": "10px",
      "fontSize": "11px",
      "width": 200
    }
  },
  {
    "id": "e2564d1a-69b7-4a15-a441-f5fcd9e68349",
    "position": {
      "x": 3000.0,
      "y": 360
    },
    "data": {
      "label": "MANAGER (waiting)\nImplement logic in the C program..."
    },
    "style": {
      "background": "#2563eb",
      "color": "white",
      "border": "none",
      "borderRadius": "8px",
      "padding": "10px",
      "fontSize": "11px",
      "width": 200
    }
  },
  {
    "id": "9f976938-0a49-449a-937a-6d94ac71cb27",
    "position": {
      "x": 4000,
      "y": 720
    },
    "data": {
      "label": "WORKER (completed)\nTest C program on typical direct..."
    },
    "style": {
      "background": "#16a34a",
      "color": "white",
      "border": "none",
      "borderRadius": "8px",
      "padding": "10px",
      "fontSize": "11px",
      "width": 200
    }
  },
  {
    "id": "1876c57b-b34c-40ed-a852-4bd5dc15b8b7",
    "position": {
      "x": 4250,
      "y": 900
    },
    "data": {
      "label": "MANAGER (analyzing)\nIdentify and create a list of ed..."
    },
    "style": {
      "background": "#2563eb",
      "color": "white",
      "border": "none",
      "borderRadius": "8px",
      "padding": "10px",
      "fontSize": "11px",
      "width": 200
    }
  },
  {
    "id": "d97fb941-dc53-40e8-af2e-5bc80583d917",
    "position": {
      "x": 4500,
      "y": 900
    },
    "data": {
      "label": "MANAGER (analyzing)\nDevelop automated test scripts t..."
    },
    "style": {
      "background": "#2563eb",
      "color": "white",
      "border": "none",
      "borderRadius": "8px",
      "padding": "10px",
      "fontSize": "11px",
      "width": 200
    }
  },
  {
    "id": "11204d9e-6453-4adf-86a7-a1aaeae2cd1e",
    "position": {
      "x": 4750,
      "y": 900
    },
    "data": {
      "label": "MANAGER (analyzing)\nAnalyze the test results to iden..."
    },
    "style": {
      "background": "#2563eb",
      "color": "white",
      "border": "none",
      "borderRadius": "8px",
      "padding": "10px",
      "fontSize": "11px",
      "width": 200
    }
  },
  {
    "id": "76932a27-3c7a-4d25-9f10-5cba2a2f71e4",
    "position": {
      "x": 4500.0,
      "y": 720
    },
    "data": {
      "label": "MANAGER (waiting)\nTest C program with edge case di..."
    },
    "style": {
      "background": "#2563eb",
      "color": "white",
      "border": "none",
      "borderRadius": "8px",
      "padding": "10px",
      "fontSize": "11px",
      "width": 200
    }
  },
  {
    "id": "c7ba6168-631e-4a4c-89f1-4132cf4fcaa9",
    "position": {
      "x": 5000,
      "y": 720
    },
    "data": {
      "label": "WORKER (completed)\nDocument test results, highlight..."
    },
    "style": {
      "background": "#16a34a",
      "color": "white",
      "border": "none",
      "borderRadius": "8px",
      "padding": "10px",
      "fontSize": "11px",
      "width": 200
    }
  },
  {
    "id": "0f975760-5fab-4b57-89a9-8d90ce902e78",
    "position": {
      "x": 4500.0,
      "y": 540
    },
    "data": {
      "label": "MANAGER (waiting)\nConduct a comprehensive correctn..."
    },
    "style": {
      "background": "#2563eb",
      "color": "white",
      "border": "none",
      "borderRadius": "8px",
      "padding": "10px",
      "fontSize": "11px",
      "width": 200
    }
  },
  {
    "id": "f4b76abc-a0d1-4e21-b95c-1f8baf386163",
    "position": {
      "x": 5250,
      "y": 900
    },
    "data": {
      "label": "WORKER (analyzing)\nSet up various directory structu..."
    },
    "style": {
      "background": "#16a34a",
      "color": "white",
      "border": "none",
      "borderRadius": "8px",
      "padding": "10px",
      "fontSize": "11px",
      "width": 200
    }
  },
  {
    "id": "afd538d5-88a1-4c9a-a6b5-5982585f448b",
    "position": {
      "x": 5500,
      "y": 900
    },
    "data": {
      "label": "PENDING (analyzing)\nRun the C program under differen..."
    },
    "style": {
      "background": "#eab308",
      "color": "white",
      "border": "none",
      "borderRadius": "8px",
      "padding": "10px",
      "fontSize": "11px",
      "width": 200
    }
  },
  {
    "id": "557d2597-3990-42ca-b4ef-45900e48fd09",
    "position": {
      "x": 5375.0,
      "y": 720
    },
    "data": {
      "label": "MANAGER (waiting)\nEvaluate the C program\\'s perfor..."
    },
    "style": {
      "background": "#2563eb",
      "color": "white",
      "border": "none",
      "borderRadius": "8px",
      "padding": "10px",
      "fontSize": "11px",
      "width": 200
    }
  },
  {
    "id": "b571efd5-663a-4e2e-8385-00a8f9311102",
    "position": {
      "x": 5750,
      "y": 900
    },
    "data": {
      "label": "MANAGER (analyzing)\nConduct performance testing unde..."
    },
    "style": {
      "background": "#2563eb",
      "color": "white",
      "border": "none",
      "borderRadius": "8px",
      "padding": "10px",
      "fontSize": "11px",
      "width": 200
    }
  },
  {
    "id": "0faff1b0-dc05-454e-9033-b040e387580d",
    "position": {
      "x": 6000,
      "y": 900
    },
    "data": {
      "label": "MANAGER (analyzing)\nAnalyze the collected resource u..."
    },
    "style": {
      "background": "#2563eb",
      "color": "white",
      "border": "none",
      "borderRadius": "8px",
      "padding": "10px",
      "fontSize": "11px",
      "width": 200
    }
  },
  {
    "id": "2ace6cc4-7583-4922-8237-120ea2a9c299",
    "position": {
      "x": 5875.0,
      "y": 720
    },
    "data": {
      "label": "MANAGER (waiting)\nAnalyze the program\\'s performan..."
    },
    "style": {
      "background": "#2563eb",
      "color": "white",
      "border": "none",
      "borderRadius": "8px",
      "padding": "10px",
      "fontSize": "11px",
      "width": 200
    }
  },
  {
    "id": "e2c5617c-a1d3-4848-bd93-0fa2a05917fc",
    "position": {
      "x": 6250,
      "y": 900
    },
    "data": {
      "label": "MANAGER (analyzing)\nAnalyze collected metrics to ide..."
    },
    "style": {
      "background": "#2563eb",
      "color": "white",
      "border": "none",
      "borderRadius": "8px",
      "padding": "10px",
      "fontSize": "11px",
      "width": 200
    }
  },
  {
    "id": "da16b404-9d8d-435d-a151-6bd9e55e45ef",
    "position": {
      "x": 6500,
      "y": 900
    },
    "data": {
      "label": "PENDING (analyzing)\nGenerate detailed recommendation..."
    },
    "style": {
      "background": "#eab308",
      "color": "white",
      "border": "none",
      "borderRadius": "8px",
      "padding": "10px",
      "fontSize": "11px",
      "width": 200
    }
  },
  {
    "id": "d293fb47-42f1-4301-8b32-d62657ea022f",
    "position": {
      "x": 6375.0,
      "y": 720
    },
    "data": {
      "label": "MANAGER (waiting)\nSynthesize collected metrics to ..."
    },
    "style": {
      "background": "#2563eb",
      "color": "white",
      "border": "none",
      "borderRadius": "8px",
      "padding": "10px",
      "fontSize": "11px",
      "width": 200
    }
  },
  {
    "id": "7f255488-2522-4a71-98ff-d409e659f35c",
    "position": {
      "x": 5875.0,
      "y": 540
    },
    "data": {
      "label": "MANAGER (waiting)\nEvaluate the performance of the ..."
    },
    "style": {
      "background": "#2563eb",
      "color": "white",
      "border": "none",
      "borderRadius": "8px",
      "padding": "10px",
      "fontSize": "11px",
      "width": 200
    }
  },
  {
    "id": "76bc175d-c8e2-4c40-8813-9c0c551f9561",
    "position": {
      "x": 5250.0,
      "y": 360
    },
    "data": {
      "label": "MANAGER (waiting)\nTest the C program for correctne..."
    },
    "style": {
      "background": "#2563eb",
      "color": "white",
      "border": "none",
      "borderRadius": "8px",
      "padding": "10px",
      "fontSize": "11px",
      "width": 200
    }
  },
  {
    "id": "4243afcf-8d3b-44bc-9f1d-24f3b175326c",
    "position": {
      "x": 3250.0,
      "y": 180
    },
    "data": {
      "label": "MANAGER (waiting)\nCreate a C program that traverse..."
    },
    "style": {
      "background": "#2563eb",
      "color": "white",
      "border": "none",
      "borderRadius": "8px",
      "padding": "10px",
      "fontSize": "11px",
      "width": 200
    }
  },
  {
    "id": "b391907b-dde4-4cfd-9b07-5f18910158bc",
    "position": {
      "x": 6750,
      "y": 360
    },
    "data": {
      "label": "WORKER (completed)\nWrite unit tests for counting fi..."
    },
    "style": {
      "background": "#16a34a",
      "color": "white",
      "border": "none",
      "borderRadius": "8px",
      "padding": "10px",
      "fontSize": "11px",
      "width": 200
    }
  },
  {
    "id": "334d055d-b9e9-4246-85ca-723cc9461952",
    "position": {
      "x": 7000,
      "y": 900
    },
    "data": {
      "label": "PENDING (analyzing)\nResearch how symbolic links are ..."
    },
    "style": {
      "background": "#eab308",
      "color": "white",
      "border": "none",
      "borderRadius": "8px",
      "padding": "10px",
      "fontSize": "11px",
      "width": 200
    }
  },
  {
    "id": "5319343c-2f18-4a84-8dea-2357c7802fa8",
    "position": {
      "x": 7250,
      "y": 900
    },
    "data": {
      "label": "PENDING (analyzing)\nDocument findings on symbolic li..."
    },
    "style": {
      "background": "#eab308",
      "color": "white",
      "border": "none",
      "borderRadius": "8px",
      "padding": "10px",
      "fontSize": "11px",
      "width": 200
    }
  },
  {
    "id": "de8c233a-1394-4ddc-8922-0923281b5906",
    "position": {
      "x": 7125.0,
      "y": 720
    },
    "data": {
      "label": "MANAGER (waiting)\nResearch and document how symbol..."
    },
    "style": {
      "background": "#2563eb",
      "color": "white",
      "border": "none",
      "borderRadius": "8px",
      "padding": "10px",
      "fontSize": "11px",
      "width": 200
    }
  },
  {
    "id": "06e89123-13f4-4fa3-83ca-ba3c74eaa469",
    "position": {
      "x": 7500,
      "y": 900
    },
    "data": {
      "label": "PENDING (analyzing)\nResearch and document common pit..."
    },
    "style": {
      "background": "#eab308",
      "color": "white",
      "border": "none",
      "borderRadius": "8px",
      "padding": "10px",
      "fontSize": "11px",
      "width": 200
    }
  },
  {
    "id": "421f7f89-73dd-4d1b-adb4-9f5454f8c827",
    "position": {
      "x": 7750,
      "y": 900
    },
    "data": {
      "label": "PENDING (analyzing)\nAnalyze the implications of symb..."
    },
    "style": {
      "background": "#eab308",
      "color": "white",
      "border": "none",
      "borderRadius": "8px",
      "padding": "10px",
      "fontSize": "11px",
      "width": 200
    }
  },
  {
    "id": "a9c46963-bbf7-4593-ad0c-e21c8458ec31",
    "position": {
      "x": 7625.0,
      "y": 720
    },
    "data": {
      "label": "MANAGER (waiting)\nIdentify and document potential ..."
    },
    "style": {
      "background": "#2563eb",
      "color": "white",
      "border": "none",
      "borderRadius": "8px",
      "padding": "10px",
      "fontSize": "11px",
      "width": 200
    }
  },
  {
    "id": "bb7385c9-5a65-4fb6-b00c-a6f3e75103c2",
    "position": {
      "x": 8000,
      "y": 900
    },
    "data": {
      "label": "PENDING (analyzing)\nResearch best practices for hand..."
    },
    "style": {
      "background": "#eab308",
      "color": "white",
      "border": "none",
      "borderRadius": "8px",
      "padding": "10px",
      "fontSize": "11px",
      "width": 200
    }
  },
  {
    "id": "533343f4-33b1-4c7e-966a-7c731c88b1fc",
    "position": {
      "x": 8250,
      "y": 900
    },
    "data": {
      "label": "MANAGER (analyzing)\nDevelop guidelines for safely co..."
    },
    "style": {
      "background": "#2563eb",
      "color": "white",
      "border": "none",
      "borderRadius": "8px",
      "padding": "10px",
      "fontSize": "11px",
      "width": 200
    }
  },
  {
    "id": "7a4ab8b4-f8d0-41f4-8888-7de4224182e4",
    "position": {
      "x": 8500,
      "y": 900
    },
    "data": {
      "label": "MANAGER (analyzing)\nCreate a testing framework to va..."
    },
    "style": {
      "background": "#2563eb",
      "color": "white",
      "border": "none",
      "borderRadius": "8px",
      "padding": "10px",
      "fontSize": "11px",
      "width": 200
    }
  },
  {
    "id": "2009a517-a527-40a7-ad9e-02eaf4b2b6cf",
    "position": {
      "x": 8250.0,
      "y": 720
    },
    "data": {
      "label": "MANAGER (waiting)\nDevelop guidelines for handling ..."
    },
    "style": {
      "background": "#2563eb",
      "color": "white",
      "border": "none",
      "borderRadius": "8px",
      "padding": "10px",
      "fontSize": "11px",
      "width": 200
    }
  },
  {
    "id": "4257b335-15ce-4d9f-bae9-cc62911c2283",
    "position": {
      "x": 7750.0,
      "y": 540
    },
    "data": {
      "label": "MANAGER (waiting)\nIdentify and document edge cases..."
    },
    "style": {
      "background": "#2563eb",
      "color": "white",
      "border": "none",
      "borderRadius": "8px",
      "padding": "10px",
      "fontSize": "11px",
      "width": 200
    }
  },
  {
    "id": "1818ba8a-0ece-41f5-a581-d00f6d11ee0b",
    "position": {
      "x": 8750,
      "y": 900
    },
    "data": {
      "label": "PENDING (analyzing)\nResearch common scenarios where ..."
    },
    "style": {
      "background": "#eab308",
      "color": "white",
      "border": "none",
      "borderRadius": "8px",
      "padding": "10px",
      "fontSize": "11px",
      "width": 200
    }
  },
  {
    "id": "ee96d106-52d9-4b24-9a4e-62fc04487311",
    "position": {
      "x": 9000,
      "y": 900
    },
    "data": {
      "label": "MANAGER (analyzing)\nAnalyze the impact of different ..."
    },
    "style": {
      "background": "#2563eb",
      "color": "white",
      "border": "none",
      "borderRadius": "8px",
      "padding": "10px",
      "fontSize": "11px",
      "width": 200
    }
  },
  {
    "id": "3c731d3e-b803-4e29-8f04-cf3d98f607b4",
    "position": {
      "x": 8875.0,
      "y": 720
    },
    "data": {
      "label": "MANAGER (waiting)\nResearch common scenarios where ..."
    },
    "style": {
      "background": "#2563eb",
      "color": "white",
      "border": "none",
      "borderRadius": "8px",
      "padding": "10px",
      "fontSize": "11px",
      "width": 200
    }
  },
  {
    "id": "3f9d1dd3-d7a9-4932-9aea-c9e063d33c6f",
    "position": {
      "x": 9250,
      "y": 900
    },
    "data": {
      "label": "MANAGER (analyzing)\nResearch common permission error..."
    },
    "style": {
      "background": "#2563eb",
      "color": "white",
      "border": "none",
      "borderRadius": "8px",
      "padding": "10px",
      "fontSize": "11px",
      "width": 200
    }
  },
  {
    "id": "64824aec-1a74-4da8-8018-79e166e25dbd",
    "position": {
      "x": 9500,
      "y": 900
    },
    "data": {
      "label": "PENDING (analyzing)\nCompile a list of workarounds fo..."
    },
    "style": {
      "background": "#eab308",
      "color": "white",
      "border": "none",
      "borderRadius": "8px",
      "padding": "10px",
      "fontSize": "11px",
      "width": 200
    }
  },
  {
    "id": "7a651bc1-5044-43c5-949e-508653376e9a",
    "position": {
      "x": 9375.0,
      "y": 720
    },
    "data": {
      "label": "MANAGER (waiting)\nDocument typical solutions and w..."
    },
    "style": {
      "background": "#2563eb",
      "color": "white",
      "border": "none",
      "borderRadius": "8px",
      "padding": "10px",
      "fontSize": "11px",
      "width": 200
    }
  },
  {
    "id": "257897b0-e025-4a56-9347-a344955d7114",
    "position": {
      "x": 9750,
      "y": 900
    },
    "data": {
      "label": "PENDING (analyzing)\nCompile the research findings in..."
    },
    "style": {
      "background": "#eab308",
      "color": "white",
      "border": "none",
      "borderRadius": "8px",
      "padding": "10px",
      "fontSize": "11px",
      "width": 200
    }
  },
  {
    "id": "792271dc-19cd-4a5b-b637-2f1329fca1cd",
    "position": {
      "x": 10000,
      "y": 900
    },
    "data": {
      "label": "PENDING (analyzing)\nDraft the comprehensive report b..."
    },
    "style": {
      "background": "#eab308",
      "color": "white",
      "border": "none",
      "borderRadius": "8px",
      "padding": "10px",
      "fontSize": "11px",
      "width": 200
    }
  },
  {
    "id": "8275041a-d417-4969-ad7f-8daa463fa6f6",
    "position": {
      "x": 9875.0,
      "y": 720
    },
    "data": {
      "label": "MANAGER (waiting)\nCompile and format the research ..."
    },
    "style": {
      "background": "#2563eb",
      "color": "white",
      "border": "none",
      "borderRadius": "8px",
      "padding": "10px",
      "fontSize": "11px",
      "width": 200
    }
  },
  {
    "id": "4ec0f67d-459b-4e64-bdbe-03b976bb1729",
    "position": {
      "x": 9375.0,
      "y": 540
    },
    "data": {
      "label": "MANAGER (waiting)\nResearch and document how permis..."
    },
    "style": {
      "background": "#2563eb",
      "color": "white",
      "border": "none",
      "borderRadius": "8px",
      "padding": "10px",
      "fontSize": "11px",
      "width": 200
    }
  },
  {
    "id": "ad2ede90-58b0-4039-a6de-77c62ea26590",
    "position": {
      "x": 10250,
      "y": 900
    },
    "data": {
      "label": "PENDING (analyzing)\nResearch the performance issues ..."
    },
    "style": {
      "background": "#eab308",
      "color": "white",
      "border": "none",
      "borderRadius": "8px",
      "padding": "10px",
      "fontSize": "11px",
      "width": 200
    }
  },
  {
    "id": "bc6c6196-e686-4d08-bf8d-79a6e5f72b70",
    "position": {
      "x": 10500,
      "y": 900
    },
    "data": {
      "label": "PENDING (analyzing)\nDocument the findings on perform..."
    },
    "style": {
      "background": "#eab308",
      "color": "white",
      "border": "none",
      "borderRadius": "8px",
      "padding": "10px",
      "fontSize": "11px",
      "width": 200
    }
  },
  {
    "id": "21fbb5db-c88e-4593-a749-f7d3055f4df7",
    "position": {
      "x": 10375.0,
      "y": 720
    },
    "data": {
      "label": "MANAGER (waiting)\nResearch and document the perfor..."
    },
    "style": {
      "background": "#2563eb",
      "color": "white",
      "border": "none",
      "borderRadius": "8px",
      "padding": "10px",
      "fontSize": "11px",
      "width": 200
    }
  },
  {
    "id": "6bfaea4b-be4d-49c3-98ac-5933f1e2d405",
    "position": {
      "x": 10750,
      "y": 900
    },
    "data": {
      "label": "MANAGER (analyzing)\nResearch existing algorithms for..."
    },
    "style": {
      "background": "#2563eb",
      "color": "white",
      "border": "none",
      "borderRadius": "8px",
      "padding": "10px",
      "fontSize": "11px",
      "width": 200
    }
  },
  {
    "id": "70229716-1ccd-42c0-9341-bc25b57350ff",
    "position": {
      "x": 11000,
      "y": 900
    },
    "data": {
      "label": "PENDING (analyzing)\nEvaluate the efficiency and scal..."
    },
    "style": {
      "background": "#eab308",
      "color": "white",
      "border": "none",
      "borderRadius": "8px",
      "padding": "10px",
      "fontSize": "11px",
      "width": 200
    }
  },
  {
    "id": "49eeba2c-d728-4d7e-812e-a470b0ad8bed",
    "position": {
      "x": 10875.0,
      "y": 720
    },
    "data": {
      "label": "MANAGER (waiting)\nAnalyze existing algorithms for ..."
    },
    "style": {
      "background": "#2563eb",
      "color": "white",
      "border": "none",
      "borderRadius": "8px",
      "padding": "10px",
      "fontSize": "11px",
      "width": 200
    }
  },
  {
    "id": "7ce8945b-00c1-4c8c-b4a1-ec4530b67ca4",
    "position": {
      "x": 11250,
      "y": 900
    },
    "data": {
      "label": "PENDING (analyzing)\nAnalyze current file counting me..."
    },
    "style": {
      "background": "#eab308",
      "color": "white",
      "border": "none",
      "borderRadius": "8px",
      "padding": "10px",
      "fontSize": "11px",
      "width": 200
    }
  },
  {
    "id": "a7ac3c40-d160-461b-9541-ca2cf4fdaf42",
    "position": {
      "x": 11500,
      "y": 900
    },
    "data": {
      "label": "MANAGER (analyzing)\nResearch and evaluate potential ..."
    },
    "style": {
      "background": "#2563eb",
      "color": "white",
      "border": "none",
      "borderRadius": "8px",
      "padding": "10px",
      "fontSize": "11px",
      "width": 200
    }
  },
  {
    "id": "e88191e5-62ce-4524-8228-8c38ed8d5b9a",
    "position": {
      "x": 11375.0,
      "y": 720
    },
    "data": {
      "label": "MANAGER (waiting)\nPropose optimization strategies ..."
    },
    "style": {
      "background": "#2563eb",
      "color": "white",
      "border": "none",
      "borderRadius": "8px",
      "padding": "10px",
      "fontSize": "11px",
      "width": 200
    }
  },
  {
    "id": "70c749db-0064-4f67-8128-8f82e9d650e6",
    "position": {
      "x": 10875.0,
      "y": 540
    },
    "data": {
      "label": "MANAGER (waiting)\nAnalyze and document the challen..."
    },
    "style": {
      "background": "#2563eb",
      "color": "white",
      "border": "none",
      "borderRadius": "8px",
      "padding": "10px",
      "fontSize": "11px",
      "width": 200
    }
  },
  {
    "id": "2a411bf2-d516-4395-93ef-b37ab271e70e",
    "position": {
      "x": 9250.0,
      "y": 360
    },
    "data": {
      "label": "MANAGER (waiting)\nIdentify and document edge cases..."
    },
    "style": {
      "background": "#2563eb",
      "color": "white",
      "border": "none",
      "borderRadius": "8px",
      "padding": "10px",
      "fontSize": "11px",
      "width": 200
    }
  },
  {
    "id": "fb436ae0-6cc9-4ddb-86e3-0997abb662f4",
    "position": {
      "x": 9125.0,
      "y": 180
    },
    "data": {
      "label": "MANAGER (waiting)\nWrite unit tests for the C progr..."
    },
    "style": {
      "background": "#2563eb",
      "color": "white",
      "border": "none",
      "borderRadius": "8px",
      "padding": "10px",
      "fontSize": "11px",
      "width": 200
    }
  },
  {
    "id": "12dad0e4-f455-4fc0-92e2-0c04644a92e1",
    "position": {
      "x": 5750.0,
      "y": 0
    },
    "data": {
      "label": "BOSS (waiting)\nwrite C code with only one file ..."
    },
    "style": {
      "background": "#7c3aed",
      "color": "white",
      "border": "none",
      "borderRadius": "8px",
      "padding": "10px",
      "fontSize": "11px",
      "width": 200
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

const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

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
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.1}
        maxZoom={2}
    >
        <MiniMap nodeColor={minimapNodeColor} zoomable pannable />
        <Controls />
        <Background variant="dots" gap={12} size={1} />
    </ReactFlow>
    </div>
);
}

