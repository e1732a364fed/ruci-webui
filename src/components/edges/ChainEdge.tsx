import { EdgeProps, getBezierPath } from "reactflow";
import { IconButton } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

export const ChainEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  selected,
}: EdgeProps) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const handleDelete = (event: React.MouseEvent) => {
    event.stopPropagation();
    const deleteEvent = new CustomEvent("edgeDelete", {
      detail: { edgeId: id },
      bubbles: true,
    });
    const element = document.querySelector(".react-flow__renderer");
    if (element) {
      element.dispatchEvent(deleteEvent);
    }
  };

  return (
    <>
      <path
        id={id}
        className="react-flow__edge-path"
        d={edgePath}
        strokeWidth={2}
        stroke={selected ? "#1976d2" : "#b1b1b7"}
      />
      {selected && (
        <foreignObject
          width={16}
          height={16}
          x={labelX - 8}
          y={labelY - 8}
          className="edgebutton-foreignobject"
          requiredExtensions="http://www.w3.org/1999/xhtml"
        >
          <IconButton
            size="small"
            onClick={handleDelete}
            sx={{
              padding: "2px",
              backgroundColor: "#fff",
              width: "16px",
              height: "16px",
              minWidth: "16px",
              "&:hover": {
                backgroundColor: "#f44336",
                color: "#fff",
              },
            }}
          >
            <DeleteIcon sx={{ fontSize: 12 }} />
          </IconButton>
        </foreignObject>
      )}
    </>
  );
};
