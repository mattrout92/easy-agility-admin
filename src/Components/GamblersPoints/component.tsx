import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

interface ObstaclePoint {
  obstacleType: string;
  points: number;
}

const GamblersPoints: React.FC = () => {
  const [obstaclePoints, setObstaclePoints] = useState<ObstaclePoint[]>([]);
  const [newObstacleType, setNewObstacleType] = useState("");
  const [newPoints, setNewPoints] = useState("");

  const handleAddPair = () => {
    if (newObstacleType && newPoints) {
      setObstaclePoints([
        ...obstaclePoints,
        { obstacleType: newObstacleType, points: parseInt(newPoints) },
      ]);
      setNewObstacleType("");
      setNewPoints("");
    }
  };

  const handleRemovePair = (index: number) => {
    const updatedPoints = obstaclePoints.filter((_, i) => i !== index);
    setObstaclePoints(updatedPoints);
  };

  return (
    <Box sx={{ maxWidth: 400, margin: "auto" }}>
      <Box sx={{ display: "flex", marginBottom: 2 }}>
        <TextField
          label="Obstacle Type"
          value={newObstacleType}
          onChange={(e) => setNewObstacleType(e.target.value)}
          sx={{ marginRight: 1, flexGrow: 1 }}
        />
        <TextField
          label="Points"
          type="number"
          value={newPoints}
          onChange={(e) => setNewPoints(e.target.value)}
          sx={{ marginRight: 1, width: "80px" }}
        />
        <Button variant="contained" onClick={handleAddPair}>
          Add
        </Button>
      </Box>
      <List>
        {obstaclePoints.map((pair, index) => (
          <ListItem
            key={index}
            secondaryAction={
              <IconButton
                edge="end"
                aria-label="delete"
                onClick={() => handleRemovePair(index)}
              >
                <DeleteIcon />
              </IconButton>
            }
          >
            <ListItemText
              primary={`${pair.obstacleType}: ${pair.points} points`}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default GamblersPoints;
