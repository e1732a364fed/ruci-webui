// import { useState, useCallback, useEffect } from "react";
import { useState, useCallback } from "react";
import ReactFlow, {
  Background,
  Controls,
  // MiniMap,
  Node,
  Edge,
  Connection,
  addEdge,
  // useNodesState,
  // useEdgesState,
  // OnEdgesChange,
  NodeTypes,
  NodeChange,
  EdgeChange,
  applyNodeChanges,
  applyEdgeChanges,
  Viewport,
} from "reactflow";
import "reactflow/dist/style.css";
import {
  Box,
  Grid,
  Paper,
  Tabs,
  Tab,
  Drawer,
  List,
  // ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton,
} from "@mui/material";
import { ChainNode, ChainNodeData } from "./components/nodes/ChainNode";
import { ChainEdge } from "./components/edges/ChainEdge";
import { GroupNode } from "./components/nodes/GroupNode";
import { Toolbar } from "./components/Toolbar";
import NodeConfigPanel from "./components/NodeConfigPanel";
import JsonPreviewPanel from "./components/JsonPreviewPanel";
import RouteEditor from "./components/RouteEditor";
import { ChainView } from "./components/ChainView";
import { AllViewNodeData } from "./components/nodes/AllViewNode";
import WelcomeInfo from "./components/WelcomeInfo";
import ControlPanel from "./components/ControlPanel";
// Import icons
import MenuIcon from "@mui/icons-material/Menu";
import InfoIcon from "@mui/icons-material/Info";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import SettingsIcon from "@mui/icons-material/Settings";

type EditorView = "all" | "inbound" | "outbound";
type EditorTab = "chain" | "route";
type SidebarView = "nodeEditor" | "info" | "controlPanel";

// interface GroupNodeData {
//   type: "group";
//   category: "inbound" | "outbound";
//   chainTag: string;
// }

// type FlowNode = Node<ChainNodeData> | Node<GroupNodeData>;
// type FlowNodeData = ChainNodeData | GroupNodeData;

// const isChainNode = (node: FlowNode): node is Node<ChainNodeData> => {
//   return !node.id.startsWith("group-");
// };

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
  const [routeConfig, setRouteConfig] = useState<Record<string, any>>([]);
  const [selectedNode, setSelectedNode] = useState<Node<ChainNodeData> | null>(
    null
  );
  const [editorTab, setEditorTab] = useState<EditorTab>("chain");
  const [currentView, setChainView] = useState<EditorView>("all");
  const [chainViewport, setChainViewport] = useState<Viewport>({
    x: 0,
    y: 0,
    zoom: 1,
  });
  const [inboundViewport, setInboundViewport] = useState<Viewport>({
    x: 0,
    y: 0,
    zoom: 1,
  });
  const [outboundViewport, setOutboundViewport] = useState<Viewport>({
    x: 0,
    y: 0,
    zoom: 1,
  });
  const [routeViewport, setRouteViewport] = useState<Viewport>({
    x: 0,
    y: 0,
    zoom: 1,
  });
  const [chainNodePositions, setChainNodePositions] = useState<
    Record<string, { x: number; y: number }>
  >({});
  // Add new state for sidebar
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [currentSidebarView, setSidebarView] = useState<SidebarView>("info");

  const drawerWidth = 240;

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

  // const onRouteEdgesChange = useCallback((edges: Edge[]) => {
  //   setRouteEdges(edges);
  // }, []);

  const getChainTags = () => {
    const inbounds: Record<string, Record<string, any>[]> = {};
    const outbounds: Record<string, Record<string, any>[]> = {};

    inboundNodes
      .filter(
        (node) =>
          node.data.chainTag &&
          !node.id.startsWith("group-") &&
          isStartNode(node, inboundNodes, inboundEdges)
      )
      .forEach((node) => {
        const tag: string = node.data.chainTag;
        inbounds[tag] = getNodeChain(node, inboundNodes, inboundEdges);
      });

    outboundNodes
      .filter(
        (node) =>
          node.data.chainTag &&
          !node.id.startsWith("group-") &&
          isStartNode(node, outboundNodes, outboundEdges)
      )
      .forEach((node) => {
        const tag: string = node.data.chainTag;
        outbounds[tag] = getNodeChain(node, outboundNodes, outboundEdges);
      });

    const config = {
      inbounds: inbounds,
      outbounds: outbounds,
      routes: {
        tag_route: routeEdges.map(
          (edge) => [edge.source, edge.target] as [string, string]
        ),
        ...routeConfig,
      },
    };

    return {
      inbounds,
      outbounds,
      config,
    };
  };

  const isStartNode = (
    node: Node<ChainNodeData>,
    nodes: Node<ChainNodeData>[],
    edges: Edge[]
  ) => {
    let currentNode: Node<ChainNodeData> | undefined = node;

    while (currentNode) {
      const nextEdge = edges.find((edge) => edge.target === currentNode?.id);
      const nextNode = nodes.find((node) => node.id === nextEdge?.source);
      if (nextNode && !nextNode.id.startsWith("group-")) {
        return false;
      } else {
        currentNode = undefined;
      }
    }
    return true;
  };

  // const isEndNode = (
  //   node: Node<ChainNodeData>,
  //   nodes: Node<ChainNodeData>[],
  //   edges: Edge[]
  // ) => {
  //   let currentNode: Node<ChainNodeData> | undefined = node;

  //   while (currentNode) {
  //     const nextEdge = edges.find((edge) => edge.source === currentNode?.id);
  //     const nextNode = nodes.find((node) => node.id === nextEdge?.target);
  //     if (nextNode && !nextNode.id.startsWith("group-")) {
  //       return false;
  //     } else {
  //       currentNode = undefined;
  //     }
  //   }
  //   return true;
  // };

  /// 返回 Record<string, any>[]
  const getNodeChain = (
    startNode: Node<ChainNodeData>,
    nodes: Node<ChainNodeData>[],
    edges: Edge[]
  ) => {
    const chain: Record<string, any>[] = [];
    let currentNode: Node<ChainNodeData> | undefined = startNode;

    while (currentNode) {
      let x: Record<string, any> = JSON.parse(
        JSON.stringify(currentNode.data.config)
      );
      x.type = currentNode.data.type;
      chain.push(x);

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

  const onChainNodesChange = useCallback((nodes: Node<AllViewNodeData>[]) => {
    const positions: Record<string, { x: number; y: number }> = {};
    nodes.forEach((node) => {
      positions[node.id] = node.position;
    });
    setChainNodePositions(positions);
  }, []);

  const handleExportJson = useCallback(() => {
    const exportData = {
      inboundNodes,
      outboundNodes,
      inboundEdges,
      outboundEdges,
      routeEdges,
      chainNodePositions,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "flow-export.json";
    a.click();
    URL.revokeObjectURL(url);
  }, [
    inboundNodes,
    outboundNodes,
    inboundEdges,
    outboundEdges,
    routeEdges,
    chainNodePositions,
  ]);

  const handleExportConfigJson = useCallback(() => {
    const config = getChainTags().config;
    const exportData: {
      inbounds: Record<string, any[]>;
      outbounds: Record<string, any[]>;
      routes: Record<string, any>;
    } = {
      inbounds: config.inbounds,
      outbounds: config.outbounds,
      routes: config.routes,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "config-export.json";
    a.click();
    URL.revokeObjectURL(url);
  }, [inboundNodes, outboundNodes, inboundEdges, outboundEdges, routeEdges]);

  const handleImportJson = useCallback((jsonString: string) => {
    try {
      const importData = JSON.parse(jsonString);

      if (importData.inboundNodes) {
        setInboundNodes(importData.inboundNodes);
      }
      if (importData.outboundNodes) {
        setOutboundNodes(importData.outboundNodes);
      }
      if (importData.inboundEdges) {
        setInboundEdges(importData.inboundEdges);
      }
      if (importData.outboundEdges) {
        setOutboundEdges(importData.outboundEdges);
      }
      if (importData.routeEdges) {
        setRouteEdges(importData.routeEdges);
      }
      if (importData.chainNodePositions) {
        setChainNodePositions(importData.chainNodePositions);
      }
    } catch (error) {
      console.error("Failed to import JSON:", error);
      alert("Invalid JSON file format");
    }
  }, []);

  const handleImportConfigJson = useCallback((jsonString: string) => {
    try {
      const importData = JSON.parse(jsonString);

      // Clear existing data
      setInboundNodes([]);
      setOutboundNodes([]);
      setInboundEdges([]);
      setOutboundEdges([]);
      setRouteEdges([]);
      setChainNodePositions({});

      // Import inbound nodes
      if (importData.inbounds) {
        const sortedKeys = Object.keys(importData.inbounds).sort();
        Object.entries(importData.inbounds).forEach(
          ([key, inbound]: [string, unknown]) => {
            const inboundArray = inbound as Record<string, any>[];
            const newInboundNodes: Node<ChainNodeData>[] = [];
            const newInboundEdges: Edge[] = [];
            let prevNodeId: string | null = null;

            inboundArray.forEach((item: any, nodeIndex: number) => {
              const type = item.type;
              const config = item;
              const nodeId = `${type.toLowerCase()}-${Date.now()}-${key}-${nodeIndex}`;

              const keyIndex = sortedKeys.indexOf(key);
              const nodePositionX = 100 + keyIndex * 300;

              const node: Node<ChainNodeData> = {
                id: nodeId,
                type: "chainNode",
                position: {
                  x: nodePositionX,
                  y: 100 + nodeIndex * 150,
                },
                data: {
                  type,
                  label: type,
                  category: "inbound",
                  chainTag: key,
                  config,
                },
              };

              if (prevNodeId) {
                newInboundEdges.push({
                  id: `${prevNodeId}-${nodeId}`,
                  source: prevNodeId,
                  target: nodeId,
                  type: "chainEdge",
                });
              }

              newInboundNodes.push(node);
              prevNodeId = nodeId;
            });
            setInboundNodes((prev) => [...prev, ...newInboundNodes]);
            setInboundEdges((prev) => [...prev, ...newInboundEdges]);
          }
        );
      }

      // Import outbound nodes
      if (importData.outbounds) {
        const sortedKeys = Object.keys(importData.outbounds).sort();
        Object.entries(importData.outbounds).forEach(
          ([key, outbound]: [string, unknown]) => {
            const outboundArray = outbound as Record<string, any>[];
            const newOutboundNodes: Node<ChainNodeData>[] = [];
            const newOutboundEdges: Edge[] = [];
            let prevNodeId: string | null = null;

            outboundArray.forEach((item: any, nodeIndex: number) => {
              const type = item.type;
              const config = item;
              const nodeId = `${type.toLowerCase()}-${Date.now()}-${key}-${nodeIndex}`;

              const keyIndex = sortedKeys.indexOf(key);
              const nodePositionX = 100 + keyIndex * 300;

              const node: Node<ChainNodeData> = {
                id: nodeId,
                type: "chainNode",
                position: {
                  x: nodePositionX,
                  y: 100 + nodeIndex * 150,
                },
                data: {
                  type,
                  label: type,
                  category: "outbound",
                  chainTag: key,
                  config,
                },
              };

              newOutboundNodes.push(node);

              if (prevNodeId) {
                newOutboundEdges.push({
                  id: `${prevNodeId}-${nodeId}`,
                  source: prevNodeId,
                  target: nodeId,
                  type: "chainEdge",
                });
              }
              prevNodeId = nodeId;
            });
            setOutboundNodes((prev) => [...prev, ...newOutboundNodes]);
            setOutboundEdges((prev) => [...prev, ...newOutboundEdges]);
          }
        );
      }

      if (importData.routes) {
        setRouteConfig(importData.routes);

        // Import route edges
        if (importData.routes.tag_route) {
          const newRouteEdges: Edge[] = importData.routes.tag_route.map(
            ([source, target]: [string, string]) => ({
              id: `${source}-${target}`,
              source,
              target,
              type: "default",
            })
          );
          setRouteEdges(newRouteEdges);
        }
      }
    } catch (error) {
      console.error("Failed to import config JSON:", error);
      alert("Invalid config JSON format");
    }
  }, []);

  const renderNodeEditor = () => {
    return (
      <>
        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
          <Tabs
            value={currentView}
            onChange={(_, newValue: EditorView) => setChainView(newValue)}
          >
            <Tab label="All" value="all" />
            <Tab label="Inbound" value="inbound" />
            <Tab label="Outbound" value="outbound" />
          </Tabs>
        </Box>
        <Grid container spacing={2} sx={{ height: "calc(100% - 48px)" }}>
          {currentView === "all" && (
            <Grid item xs={12}>
              <ChainView
                in_chainNodes={inboundNodes}
                out_chainNodes={outboundNodes}
                viewport={chainViewport}
                onViewportChange={setChainViewport}
                nodePositions={chainNodePositions}
                onNodesChange={onChainNodesChange}
              />
            </Grid>
          )}
          {currentView === "inbound" && (
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
                  defaultViewport={inboundViewport}
                  onMoveEnd={(_, viewport) => setInboundViewport(viewport)}
                  fitView={!inboundViewport}
                >
                  <Background />
                  <Controls />
                </ReactFlow>
              </Paper>
            </Grid>
          )}
          {currentView === "outbound" && (
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
                  defaultViewport={outboundViewport}
                  onMoveEnd={(_, viewport) => setOutboundViewport(viewport)}
                  fitView={!outboundViewport}
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

  const renderMainContent = () => {
    if (currentSidebarView === "info") {
      return <WelcomeInfo />;
    }

    if (currentSidebarView === "controlPanel") {
      return <ControlPanel />;
    }

    return (
      <>
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
              <Grid item xs={12}>
                <Toolbar
                  onAddNode={onAddNode}
                  category={currentView}
                  onExportJson={handleExportJson}
                  onImportJson={handleImportJson}
                  onExportConfigJson={handleExportConfigJson}
                  onImportConfigJson={handleImportConfigJson}
                />
              </Grid>
            )}
            {editorTab === "chain" ? (
              renderNodeEditor()
            ) : (
              <Paper elevation={3} sx={{ height: "calc(100% - 100px)" }}>
                <RouteEditor
                  initialEdges={routeEdges}
                  onEdgesChange={setRouteEdges}
                  inboundChains={Object.keys(getChainTags().inbounds)}
                  outboundChains={Object.keys(getChainTags().outbounds)}
                  config={getChainTags().config}
                  viewport={routeViewport}
                  onViewportChange={setRouteViewport}
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
                    routes: getChainTags().config.routes,
                  }}
                />
              )}
            </Box>
          </Grid>
        </Grid>
      </>
    );
  };

  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
      <Drawer
        variant="persistent"
        anchor="left"
        open={drawerOpen}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            padding: 1,
            justifyContent: "flex-end",
          }}
        >
          <IconButton onClick={() => setDrawerOpen(false)}>
            <ChevronLeftIcon />
          </IconButton>
        </Box>
        <Divider />
        <List>
          <ListItemButton
            selected={currentSidebarView === "info"}
            onClick={() => setSidebarView("info")}
          >
            <ListItemIcon>
              <InfoIcon />
            </ListItemIcon>
            <ListItemText primary="Info" />
          </ListItemButton>

          <ListItemButton
            selected={currentSidebarView === "controlPanel"}
            onClick={() => setSidebarView("controlPanel")}
          >
            <ListItemIcon>
              <SettingsIcon />
            </ListItemIcon>
            <ListItemText primary="Control Panel" />
          </ListItemButton>

          <ListItemButton
            selected={currentSidebarView === "nodeEditor"}
            onClick={() => setSidebarView("nodeEditor")}
          >
            <ListItemIcon>
              <AccountTreeIcon />
            </ListItemIcon>
            <ListItemText primary="Node Editor" />
          </ListItemButton>
        </List>
      </Drawer>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 2,
          transition: (theme) =>
            theme.transitions.create("margin", {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
          marginLeft: drawerOpen ? 0 : `-${drawerWidth}px`,
          width: drawerOpen ? `calc(100% - ${drawerWidth}px)` : "100%",
          height: "100%",
        }}
      >
        {!drawerOpen && (
          <IconButton sx={{ mb: 2 }} onClick={() => setDrawerOpen(true)}>
            <MenuIcon />
          </IconButton>
        )}
        {renderMainContent()}
      </Box>
    </Box>
  );
}
