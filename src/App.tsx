import { useState, useCallback, useEffect } from "react";
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
import { Box, Grid, Paper, Tabs, Tab } from "@mui/material";
import { ChainNode, ChainNodeData } from "./components/nodes/ChainNode";
import { ChainEdge } from "./components/edges/ChainEdge";
import { GroupNode } from "./components/nodes/GroupNode";
import { Toolbar } from "./components/Toolbar";
import NodeConfigPanel from "./components/NodeConfigPanel";
import JsonPreviewPanel from "./components/JsonPreviewPanel";
import RouteEditor from "./components/RouteEditor";
import { ChainView } from "./components/ChainView";
import { AllViewNodeData } from "./components/nodes/AllViewNode";

type EditorView = "all" | "inbound" | "outbound";
type EditorTab = "chain" | "route";

interface GroupNodeData {
  type: "group";
  category: "inbound" | "outbound";
  chainTag: string;
}

type FlowNode = Node<ChainNodeData> | Node<GroupNodeData>;
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
  const [selectedNode, setSelectedNode] = useState<Node<ChainNodeData> | null>(
    null
  );
  const [editorTab, setEditorTab] = useState<EditorTab>("chain");
  const [chainView, setChainView] = useState<EditorView>("all");
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
    const inbounds = inboundNodes
      .filter(
        (node) =>
          node.data.chainTag &&
          !node.id.startsWith("group-") &&
          isStartNode(node, inboundNodes, inboundEdges)
      )
      .map((node) => ({
        tag: node.data.chainTag,
        chain: getNodeChain(node, inboundNodes, inboundEdges),
      }));

    const outbounds = outboundNodes
      .filter(
        (node) =>
          node.data.chainTag &&
          !node.id.startsWith("group-") &&
          isStartNode(node, outboundNodes, outboundEdges)
      )
      .map((node) => ({
        tag: node.data.chainTag,
        chain: getNodeChain(node, outboundNodes, outboundEdges),
      }));

    const config = {
      inbounds: inbounds,
      outbounds: outbounds,
      tag_route: routeEdges.map(
        (edge) => [edge.source, edge.target] as [string, string]
      ),
      fallback_route: [] as [string, string][],
    };

    return {
      inbounds: inbounds,
      outbounds: outbounds,
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
    const exportData = {
      inbounds: config.inbounds.map((item) => ({
        tag: item.tag,
        chain: item.chain,
      })),
      outbounds: config.outbounds.map((item) => ({
        tag: item.tag,
        chain: item.chain,
      })),
      tag_route: config.tag_route,
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

      // 清除现有数据
      setInboundNodes([]);
      setOutboundNodes([]);
      setInboundEdges([]);
      setOutboundEdges([]);
      setRouteEdges([]);
      setChainNodePositions({});

      // 导入入站链
      if (importData.inbounds) {
        const newInboundNodes: Node<ChainNodeData>[] = [];
        const newInboundEdges: Edge[] = [];

        // 为每个 chain 创建一列节点
        importData.inbounds.forEach((inbound: any, chainIndex: number) => {
          let prevNodeId: string | null = null;
          // 在这个 chain 中创建节点
          inbound.chain.forEach((item: any, nodeIndex: number) => {
            const type = item.type; //Object.keys(item)[0];
            const config = item; //item[type];
            const nodeId = `${type.toLowerCase()}-${Date.now()}-${chainIndex}-${nodeIndex}`;

            const node: Node<ChainNodeData> = {
              id: nodeId,
              type: "chainNode",
              // 每个 chain 占据一列，列之间间隔 300 像素
              // 同一 chain 中的节点垂直排列，间隔 150 像素
              position: {
                x: 100 + chainIndex * 300,
                y: 100 + nodeIndex * 150,
              },
              data: {
                type,
                label: type,
                category: "inbound",
                chainTag: inbound.tag,
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
        });
        setInboundNodes(newInboundNodes);
        setInboundEdges(newInboundEdges);
      }

      // 导入出站链
      if (importData.outbounds) {
        const newOutboundNodes: Node<ChainNodeData>[] = [];
        const newOutboundEdges: Edge[] = [];

        // 为每个 chain 创建一列节点
        importData.outbounds.forEach((outbound: any, chainIndex: number) => {
          let prevNodeId: string | null = null;
          // 在这个 chain 中创建节点
          outbound.chain.forEach((item: any, nodeIndex: number) => {
            const type = item.type; //const type = Object.keys(item)[0];
            const config = item; //const config = item[type];

            const nodeId = `${type.toLowerCase()}-${Date.now()}-${chainIndex}-${nodeIndex}`;

            const node: Node<ChainNodeData> = {
              id: nodeId,
              type: "chainNode",
              // 每个 chain 占据一列，列之间间隔 300 像素
              // 同一 chain 中的节点垂直排列，间隔 150 像素
              position: {
                x: 100 + chainIndex * 300,
                y: 100 + nodeIndex * 150,
              },
              data: {
                type,
                label: type,
                category: "outbound",
                chainTag: outbound.tag,
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
        });
        setOutboundNodes(newOutboundNodes);
        setOutboundEdges(newOutboundEdges);
      }

      // 导入路由
      if (importData.tag_route) {
        const newRouteEdges: Edge[] = importData.tag_route.map(
          ([source, target]: [string, string]) => ({
            id: `${source}-${target}`,
            source,
            target,
            type: "default",
          })
        );
        setRouteEdges(newRouteEdges);
      }
    } catch (error) {
      console.error("Failed to import config JSON:", error);
      alert("Invalid config JSON format");
    }
  }, []);

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
                viewport={chainViewport}
                onViewportChange={setChainViewport}
                nodePositions={chainNodePositions}
                onNodesChange={onChainNodesChange}
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
            <Grid item xs={12}>
              <Toolbar
                onAddNode={onAddNode}
                category={chainView}
                onExportJson={handleExportJson}
                onImportJson={handleImportJson}
                onExportConfigJson={handleExportConfigJson}
                onImportConfigJson={handleImportConfigJson}
              />
            </Grid>
          )}
          {editorTab === "chain" ? (
            renderChainEditor()
          ) : (
            <Paper elevation={3} sx={{ height: "calc(100% - 100px)" }}>
              <RouteEditor
                initialEdges={routeEdges}
                onEdgesChange={setRouteEdges}
                inboundChains={getChainTags().inbounds.map((tag) => tag.tag)}
                outboundChains={getChainTags().outbounds.map((tag) => tag.tag)}
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
                  tag_route: getChainTags().config.tag_route,
                  fallback_route: [],
                }}
              />
            )}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
