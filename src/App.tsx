import { useState, useCallback } from "react";
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  Connection,
  NodeChange,
  EdgeChange,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
} from "reactflow";
import "reactflow/dist/style.css";
import { Box, Grid, Paper, Tabs, Tab } from "@mui/material";
import { ChainNode, ChainNodeData } from "./components/nodes/ChainNode";
import { ChainEdge } from "./components/edges/ChainEdge";
import { Toolbar } from "./components/Toolbar";
import NodeConfigPanel from "./components/NodeConfigPanel";
import JsonPreviewPanel from "./components/JsonPreviewPanel";
import RouteEditor from "./components/RouteEditor";

const nodeTypes = {
  chainNode: ChainNode,
};

const edgeTypes = {
  chainEdge: ChainEdge,
};

type EditorView = "all" | "inbound" | "outbound";
type EditorTab = "chain" | "route";

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

  const onEdgesDelete = useCallback(
    (edges: Edge[], category: "inbound" | "outbound") => {
      if (category === "inbound") {
        edges.forEach((edge) => {
          const targetNode = inboundNodes.find(
            (node) => node.id === edge.target
          );
          if (targetNode) {
            setInboundNodes((nodes) =>
              nodes.map((node) =>
                node.id === targetNode.id
                  ? {
                      ...node,
                      data: {
                        ...node.data,
                        chainTag: node.data.type,
                      },
                    }
                  : node
              )
            );
          }
        });
      } else {
        edges.forEach((edge) => {
          const targetNode = outboundNodes.find(
            (node) => node.id === edge.target
          );
          if (targetNode) {
            setOutboundNodes((nodes) =>
              nodes.map((node) =>
                node.id === targetNode.id
                  ? {
                      ...node,
                      data: {
                        ...node.data,
                        chainTag: node.data.type,
                      },
                    }
                  : node
              )
            );
          }
        });
      }
    },
    [inboundNodes, outboundNodes]
  );

  const onNodesChange = useCallback(
    (changes: NodeChange[], category: "inbound" | "outbound") => {
      if (category === "inbound") {
        setInboundNodes((nds) => applyNodeChanges(changes, nds));
      } else {
        setOutboundNodes((nds) => applyNodeChanges(changes, nds));
      }
    },
    []
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[], category: "inbound" | "outbound") => {
      const removedEdges = changes
        .filter((change) => change.type === "remove")
        .map((change) => ({ id: change.id }));
      if (removedEdges.length > 0) {
        const edges = category === "inbound" ? inboundEdges : outboundEdges;
        const deletedEdges = edges.filter((edge) =>
          removedEdges.some((re) => re.id === edge.id)
        );
        onEdgesDelete(deletedEdges, category);
      }

      if (category === "inbound") {
        setInboundEdges((eds) => applyEdgeChanges(changes, eds));
      } else {
        setOutboundEdges((eds) => applyEdgeChanges(changes, eds));
      }
    },
    [inboundEdges, outboundEdges, onEdgesDelete]
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
      .filter((node) => node.data.chainTag)
      .map((node) => ({
        tag: node.data.chainTag,
        chain: getNodeChain(node, inboundNodes, inboundEdges),
      }));

    const outboundTags = outboundNodes
      .filter((node) => node.data.chainTag)
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
      currentNode = nodes.find((node) => node.id === nextEdge?.target);
    }

    return chain;
  };

  const renderChainEditor = () => {
    const gridSize = chainView === "all" ? 6 : 12;
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
          {(chainView === "all" || chainView === "inbound") && (
            <Grid item xs={gridSize}>
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
          {(chainView === "all" || chainView === "outbound") && (
            <Grid item xs={gridSize}>
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
