import { useState, useCallback, useEffect } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  Connection,
  addEdge,
  useNodesState,
  useEdgesState,
  OnEdgesChange,
  NodeTypes,
  NodeChange,
  EdgeChange,
  applyNodeChanges,
  applyEdgeChanges,
} from "reactflow";
import "reactflow/dist/style.css";
import { Box, Grid, Paper, Tabs, Tab } from "@mui/material";
import { ChainNode, ChainNodeData } from "./components/nodes/ChainNode";
import { ChainEdge } from "./components/edges/ChainEdge";
import { GroupNode } from "./components/nodes/GroupNode";
import { Toolbar } from "./components/Toolbar";
import NodeConfigPanel from "./components/NodeConfigPanel";
import JsonPreviewPanel from "./components/JsonPreviewPanel";
import RouteEditor from "./components/RouteEditor";
import { ChainView } from "./components/ChainView";

type EditorView = "all" | "inbound" | "outbound";
type EditorTab = "chain" | "route";

interface GroupNodeData {
  type: "group";
  category: "inbound" | "outbound";
  chainTag: string;
}

type FlowNode = Node<ChainNodeData> | Node<GroupNodeData>;
type FlowNodeData = ChainNodeData | GroupNodeData;

const isChainNode = (node: FlowNode): node is Node<ChainNodeData> => {
  return !node.id.startsWith("group-");
};

const nodeTypes: NodeTypes = {
  chainNode: ChainNode,
  group: GroupNode,
};

const edgeTypes = {
  chainEdge: ChainEdge,
};

export default function App() {
  const [inboundNodes, setInboundNodes] = useState<Node<ChainNodeData>[]>([]);
  const [outboundNodes, setOutboundNodes] = useState<Node<ChainNodeData>[]>([]);
  const [inboundEdges, setInboundEdges] = useState<Edge[]>([]);
  const [outboundEdges, setOutboundEdges] = useState<Edge[]>([]);
  const [routeEdges, setRouteEdges] = useState<Edge[]>([]);
  const [selectedNode, setSelectedNode] = useState<Node<ChainNodeData> | null>(
    null
  );
  const [editorTab, setEditorTab] = useState<EditorTab>("chain");
  const [chainView, setChainView] = useState<EditorView>("all");

  const onNodesChange = useCallback(
    (changes: NodeChange[], category: "inbound" | "outbound") => {
      if (category === "inbound") {
        setInboundNodes((nds) => {
          const filteredChanges = changes.filter((change) => {
            if (change.type === "remove") {
              const node = nds.find((n) => n.id === change.id);
              return node && !node.id.startsWith("group-");
            }
            return true;
          });
          return applyNodeChanges(filteredChanges, nds);
        });
      } else {
        setOutboundNodes((nds) => {
          const filteredChanges = changes.filter((change) => {
            if (change.type === "remove") {
              const node = nds.find((n) => n.id === change.id);
              return node && !node.id.startsWith("group-");
            }
            return true;
          });
          return applyNodeChanges(filteredChanges, nds);
        });
      }
    },
    []
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[], category: "inbound" | "outbound") => {
      if (category === "inbound") {
        setInboundEdges((eds) => applyEdgeChanges(changes, eds));
      } else {
        setOutboundEdges((eds) => applyEdgeChanges(changes, eds));
      }
    },
    []
  );

  const onConnect = useCallback(
    (connection: Connection, category: "inbound" | "outbound") => {
      if (category === "inbound") {
        setInboundEdges((eds) => addEdge(connection, eds));
        const sourceNode = inboundNodes.find(
          (node) => node.id === connection.source
        );
        const targetNode = inboundNodes.find(
          (node) => node.id === connection.target
        );
        if (sourceNode && targetNode) {
          setInboundNodes((nodes) =>
            nodes.map((node) =>
              node.id === targetNode.id
                ? {
                    ...node,
                    data: {
                      ...node.data,
                      chainTag: sourceNode.data.chainTag,
                    },
                  }
                : node
            )
          );
        }
      } else {
        setOutboundEdges((eds) => addEdge(connection, eds));
        const sourceNode = outboundNodes.find(
          (node) => node.id === connection.source
        );
        const targetNode = outboundNodes.find(
          (node) => node.id === connection.target
        );
        if (sourceNode && targetNode) {
          setOutboundNodes((nodes) =>
            nodes.map((node) =>
              node.id === targetNode.id
                ? {
                    ...node,
                    data: {
                      ...node.data,
                      chainTag: sourceNode.data.chainTag,
                    },
                  }
                : node
            )
          );
        }
      }
    },
    [inboundNodes, outboundNodes]
  );

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node<ChainNodeData>) => {
      setSelectedNode(node);
    },
    []
  );

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const onNodeUpdate = useCallback((updatedNode: Node<ChainNodeData>) => {
    const updateNodes =
      updatedNode.data.category === "inbound"
        ? setInboundNodes
        : setOutboundNodes;
    updateNodes((nodes) =>
      nodes.map((node) => (node.id === updatedNode.id ? updatedNode : node))
    );
  }, []);

  const generateUniqueChainTag = (
    baseTag: string,
    category: "inbound" | "outbound"
  ) => {
    const existingNodes = category === "inbound" ? inboundNodes : outboundNodes;
    const existingTags = existingNodes.map((node) => node.data.chainTag);

    if (!existingTags.includes(baseTag)) {
      return baseTag;
    }

    let counter = 1;
    while (existingTags.includes(`${baseTag}_${counter}`)) {
      counter++;
    }
    return `${baseTag}_${counter}`;
  };

  const onAddNode = useCallback(
    (node: Node<ChainNodeData>) => {
      const uniqueChainTag = generateUniqueChainTag(
        node.data.type,
        node.data.category
      );
      const nodeWithChain = {
        ...node,
        data: {
          ...node.data,
          chainTag: uniqueChainTag,
        },
      };

      if (node.data.category === "inbound") {
        setInboundNodes((nodes) => [...nodes, nodeWithChain]);
      } else {
        setOutboundNodes((nodes) => [...nodes, nodeWithChain]);
      }
    },
    [inboundNodes, outboundNodes]
  );

  const onRouteEdgesChange = useCallback((edges: Edge[]) => {
    setRouteEdges(edges);
  }, []);

  const getChainTags = () => {
    const inboundTags = inboundNodes
      .filter((node) => node.data.chainTag && !node.id.startsWith("group-"))
      .map((node) => ({
        tag: node.data.chainTag,
        chain: getNodeChain(node, inboundNodes, inboundEdges),
      }));

    const outboundTags = outboundNodes
      .filter((node) => node.data.chainTag && !node.id.startsWith("group-"))
      .map((node) => ({
        tag: node.data.chainTag,
        chain: getNodeChain(node, outboundNodes, outboundEdges),
      }));

    const config = {
      inbounds: inboundTags,
      outbounds: outboundTags,
      tag_route: routeEdges.map(
        (edge) => [edge.source, edge.target] as [string, string]
      ),
      fallback_route: [] as [string, string][],
      rule_route: null,
    };

    return {
      inboundTags,
      outboundTags,
      config,
    };
  };

  const getNodeChain = (
    startNode: Node<ChainNodeData>,
    nodes: Node<ChainNodeData>[],
    edges: Edge[]
  ) => {
    const chain = [];
    let currentNode: Node<ChainNodeData> | undefined = startNode;

    while (currentNode) {
      chain.push({ [currentNode.data.type]: currentNode.data.config });
      const nextEdge = edges.find((edge) => edge.source === currentNode?.id);
      const nextNode = nodes.find((node) => node.id === nextEdge?.target);
      if (nextNode && !nextNode.id.startsWith("group-")) {
        currentNode = nextNode;
      } else {
        currentNode = undefined;
      }
    }

    return chain;
  };

  const renderChainEditor = () => {
    return (
      <>
        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
          <Tabs
            value={chainView}
            onChange={(_, newValue: EditorView) => setChainView(newValue)}
          >
            <Tab label="All" value="all" />
            <Tab label="Inbound" value="inbound" />
            <Tab label="Outbound" value="outbound" />
          </Tabs>
        </Box>
        <Grid container spacing={2} sx={{ height: "calc(100% - 48px)" }}>
          {chainView === "all" && (
            <Grid item xs={12}>
              <ChainView
                in_chainNodes={inboundNodes}
                out_chainNodes={outboundNodes}
                inboundEdges={inboundEdges}
                outboundEdges={outboundEdges}
              />
            </Grid>
          )}
          {chainView === "inbound" && (
            <Grid item xs={12}>
              <Paper
                elevation={3}
                sx={{
                  height: "100%",
                  "& .react-flow__renderer": { borderRadius: 1 },
                }}
              >
                <ReactFlow
                  nodes={inboundNodes}
                  edges={inboundEdges}
                  onNodesChange={(changes) => onNodesChange(changes, "inbound")}
                  onEdgesChange={(changes) => onEdgesChange(changes, "inbound")}
                  onConnect={(conn) => onConnect(conn, "inbound")}
                  onNodeClick={onNodeClick}
                  onPaneClick={onPaneClick}
                  nodeTypes={nodeTypes}
                  edgeTypes={edgeTypes}
                  defaultEdgeOptions={{ type: "chainEdge" }}
                  onInit={() => {
                    setTimeout(() => {
                      const container = document.querySelector(".react-flow");
                      if (container) {
                        container.addEventListener("nodeDelete", ((
                          e: CustomEvent
                        ) => {
                          onNodesChange(
                            [{ type: "remove", id: e.detail.nodeId }],
                            "inbound"
                          );
                        }) as EventListener);
                        container.addEventListener("edgeDelete", ((
                          e: CustomEvent
                        ) => {
                          onEdgesChange(
                            [{ type: "remove", id: e.detail.edgeId }],
                            "inbound"
                          );
                        }) as EventListener);
                      }
                    }, 0);
                  }}
                  fitView
                >
                  <Background />
                  <Controls />
                </ReactFlow>
              </Paper>
            </Grid>
          )}
          {chainView === "outbound" && (
            <Grid item xs={12}>
              <Paper
                elevation={3}
                sx={{
                  height: "100%",
                  "& .react-flow__renderer": { borderRadius: 1 },
                }}
              >
                <ReactFlow
                  nodes={outboundNodes}
                  edges={outboundEdges}
                  onNodesChange={(changes) =>
                    onNodesChange(changes, "outbound")
                  }
                  onEdgesChange={(changes) =>
                    onEdgesChange(changes, "outbound")
                  }
                  onConnect={(conn) => onConnect(conn, "outbound")}
                  onNodeClick={onNodeClick}
                  onPaneClick={onPaneClick}
                  nodeTypes={nodeTypes}
                  edgeTypes={edgeTypes}
                  defaultEdgeOptions={{ type: "chainEdge" }}
                  onInit={() => {
                    setTimeout(() => {
                      const container = document.querySelector(".react-flow");
                      if (container) {
                        container.addEventListener("nodeDelete", ((
                          e: CustomEvent
                        ) => {
                          onNodesChange(
                            [{ type: "remove", id: e.detail.nodeId }],
                            "outbound"
                          );
                        }) as EventListener);
                        container.addEventListener("edgeDelete", ((
                          e: CustomEvent
                        ) => {
                          onEdgesChange(
                            [{ type: "remove", id: e.detail.edgeId }],
                            "outbound"
                          );
                        }) as EventListener);
                      }
                    }, 0);
                  }}
                  fitView
                >
                  <Background />
                  <Controls />
                </ReactFlow>
              </Paper>
            </Grid>
          )}
        </Grid>
      </>
    );
  };

  return (
    <Box sx={{ height: "100vh", p: 2 }}>
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
        <Tabs
          value={editorTab}
          onChange={(_, newValue: EditorTab) => setEditorTab(newValue)}
        >
          <Tab label="Chain Editor" value="chain" />
          <Tab label="Route Editor" value="route" />
        </Tabs>
      </Box>
      <Grid container spacing={2} sx={{ height: "calc(100% - 48px)" }}>
        <Grid item xs={9}>
          {editorTab === "chain" && (
            <Toolbar
              onAddNode={onAddNode}
              category={chainView === "all" ? "all" : chainView}
            />
          )}
          {editorTab === "chain" ? (
            renderChainEditor()
          ) : (
            <Paper elevation={3} sx={{ height: "calc(100% - 100px)" }}>
              <RouteEditor
                initialEdges={routeEdges}
                onEdgesChange={setRouteEdges}
                inboundChains={getChainTags().inboundTags.map((tag) => tag.tag)}
                outboundChains={getChainTags().outboundTags.map(
                  (tag) => tag.tag
                )}
                config={getChainTags().config}
              />
            </Paper>
          )}
        </Grid>
        <Grid item xs={3} sx={{ height: "100%" }}>
          <Box
            sx={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            {editorTab === "chain" ? (
              <>
                <NodeConfigPanel
                  selectedNode={selectedNode}
                  onNodeUpdate={onNodeUpdate}
                />
                <JsonPreviewPanel config={getChainTags().config} />
              </>
            ) : (
              <JsonPreviewPanel
                config={{
                  tag_route: getChainTags().config.tag_route,
                  fallback_route: [],
                  rule_route: null,
                }}
              />
            )}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
