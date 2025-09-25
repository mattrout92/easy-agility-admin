import React, { useEffect, useState } from "react";
import "./App.css";
import {
  Alert,
  Box,
  Button,
  CssBaseline,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Modal,
  Select,
  Snackbar,
  TextField,
  Typography,
  AppBar,
  Toolbar,
  Container,
  Card,
  CardContent,
  Tabs,
  Tab,
  Chip,
  IconButton,
  Divider,
} from "@mui/material";
import {
  PlayArrow,
  Queue,
  Score,
  Settings,
  Refresh,
  Warning,
  CheckCircle,
  Cancel,
  Timer,
  Speed,
} from "@mui/icons-material";
import axios from "axios";
import { DataGrid } from "@mui/x-data-grid";

const modalStyle = {
  minWidth: "350px",
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "white",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

export type Entry = {
  class_name: string;
  id: number;
  queued_at: string | null;
  partnership?: string;
  time?: number;
  nfc_run?: boolean;
  eliminated?: boolean;
  total_faults?: number;
  run_data?: string[];
  last_result_class_different?: boolean;
  picture_url?: string;
};

type Show = {
  name: string;
  date: Date;
  venue: string;
  classes: C[];
};

type C = {
  id: number;
  name: string;
  height_grades: any;
  metadata?: any;
  status?: string;
};

const showID = 54;
const ringId = 11;

// Tab Panel Component
function TabPanel({ children, value, index, ...other }: any) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: { xs: 1, md: 3 } }}>{children}</Box>}
    </div>
  );
}

// Main App Component
function App() {
  // State management
  const [activeTab, setActiveTab] = useState(0);
  const [faults, setFaults] = useState<string[]>([]);
  const [faults100, setFaults100] = useState<string[]>([]);
  const [eliminated, setEliminated] = useState<boolean>(false);
  const [nfcRun, setNFCRun] = useState<boolean>(false);
  const [time, setTime] = useState<string>("0.000");
  const [points, setPoints] = useState<number[]>([]);
  const [queue, setQueue] = useState<boolean>(false);
  const [scrime, setScrime] = useState<boolean>(false);
  const [classValue, setClassValue] = useState<number>(0);
  const [height, setHeight] = useState<string>("");
  const [entries, setEntries] = useState<Entry[]>([]);
  const [queueConfirmOpen, setQueueConfirmOpen] = useState<boolean>(false);
  const [classDetailsOpen, setClassDetailsOpen] = useState<boolean>(false);
  const [submitResultOpen, setSubmitResultOpen] = useState<boolean>(false);
  const [disableSubmit, setDisableSubmit] = useState<boolean>(false);
  const [courseDistance, setCourseDistance] = useState<number>(0);
  const [courseTime, setCourseTime] = useState<number>(0);
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [closeClassOpen, setCloseClassOpen] = useState<boolean>(false);
  const [sendMessageOpen, setSendMessageOpen] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [changeHandlerName, setChangeHandlerName] = useState<boolean>(false);
  const [newHandlerName, setNewHandlerName] = useState<string>("");
  const [entryId, setEntryId] = useState<number>(0);
  const [bumpConfirmOpen, setBumpConfirmOpen] = useState<boolean>(false);
  const [bumpEntry, setBumpEntry] = useState<Entry>({} as Entry);

  const [queuedEntry, setQueuedEntry] = useState<Entry>({} as Entry);
  const [nextEntry, setNextEntry] = useState<Entry>({} as Entry);
  const [show, setShow] = useState<Show>({} as Show);
  const [heights, setHeights] = useState<string[]>([]);

  // Effects
  useEffect(() => {
    // Only check course details when in Queue tab (activeTab === 1)
    if (activeTab === 1) {
      checkCourseDetails();
    }
    getEntries(classValue);
    // eslint-disable-next-line
  }, [height, classValue, activeTab]);

  useEffect(() => {
    getShow();
    getNextEntry();
    // eslint-disable-next-line
  }, []);

  // Business Logic Functions (preserved from original)
  const handleChangeTime = (event: any) => {
    let inputValue = event.target.value;
    inputValue = inputValue.replace(/[^0-9]/g, "");
    if (inputValue === "") {
      setTime("0.000");
      return;
    }
    let numericValue = parseInt(inputValue, 10);
    numericValue = numericValue / 1000;
    const formattedValue = numericValue.toFixed(3);
    setTime(formattedValue);
  };

  const setClassMessage = async () => {
    const c = show?.classes?.find((c) => c.id === classValue);
    if (c) {
      await axios.post(`https://api.easyagility.co.uk/add-class-message`, {
        message: `${c.name} - ${message}`,
        class_id: c.id,
      });
    }
  };

  const changeHandlerNameReq = async () => {
    await axios.post(`https://api.easyagility.co.uk/change-handler-name`, {
      handler_name: newHandlerName,
      entry_id: entryId,
    });
  };

  const checkCourseDetails = () => {
    // Only check course details when in Queue tab
    if (activeTab !== 1) return;

    const c = show?.classes?.find((c) => c.id === classValue);
    if (
      c &&
      (!c?.metadata ||
        !c?.metadata[height] ||
        !c?.metadata[height].course_time ||
        !c?.metadata[height].course_distance)
    ) {
      setClassDetailsOpen(true);
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.name === "course_time") {
      setCourseTime(parseInt(event.target.value));
    } else {
      setCourseDistance(parseInt(event.target.value));
    }
  };

  const updateClassDetails = async () => {
    await axios.post("https://api.easyagility.co.uk/update-class-details", {
      class_id: classValue,
      height: height,
      course_time: courseTime,
      course_distance: courseDistance,
    });
    await getShow();
    setClassDetailsOpen(false);
  };

  const closeClass = async () => {
    await axios.post(
      `https://api.easyagility.co.uk/shows/${showID}/classes/${classValue}/close`
    );
    for (const c of show.classes) {
      if (c.status === "open" && c.id !== classValue) {
        setClassValue(c.id);
        const heightGrades = show.classes.find(
          (cl) => cl.id === c.id
        )?.height_grades;
        const heights = Object.keys(heightGrades);
        setHeights(heights);
        setHeight(heights[0]);
        getShow();
        break;
      }
    }
  };

  const getShow = async () => {
    const response = await axios.get(
      `https://api.easyagility.co.uk/shows/${showID}?ring_id=${ringId}`
    );
    setShow(response.data);
    const s = response.data;
    if (classValue === 0 && s) {
      for (const c of response.data.classes) {
        if (c.status === "open") {
          setClassValue(c.id);
          const heightGrades = s.classes.find(
            (cl: any) => cl.id === c.id
          )?.height_grades;
          const heights = Object.keys(heightGrades);
          setHeights(heights);
          setHeight(heights[0]);
          break;
        }
      }
    }
    if (response.data?.classes[0].height_grades && classValue === 0) {
      const heightGrades = response.data?.classes[0].height_grades as any;
      const heights = Object.keys(heightGrades);
      setHeights(heights);
      setHeight(heights[0]);
      if (
        !response.data?.classes[0].metadata ||
        !response.data?.classes[0].metadata[heights[0]] ||
        !response.data?.classes[0].metadata[heights[0]].course_time ||
        !response.data?.classes[0].metadata[heights[0]].course_distance
      ) {
        setClassDetailsOpen(true);
      }
    }
  };

  const getNextEntry = async () => {
    const response = await axios.get(
      `https://api.easyagility.co.uk/shows/${showID}/entries/next?ring_id=${ringId}`
    );
    setNextEntry(response.data);
  };

  const getEntries = async (classValue: number) => {
    if (height) {
      const response = await axios.get(
        `https://api.easyagility.co.uk/shows/${showID}/classes/${classValue}/entries?height=${encodeURIComponent(
          height
        )}`
      );
      setEntries(response.data);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => getEntries(classValue), 30000);
    return () => {
      clearInterval(interval);
    };
    // eslint-disable-next-line
  }, [classValue, height]);

  const queueEntry = async (entryId: number) => {
    await axios.post(`https://api.easyagility.co.uk/entries/${entryId}/queue`);
    await getEntries(classValue);
  };

  const unqueueEntry = async (entryId: number) => {
    await axios.post(
      `https://api.easyagility.co.uk/entries/${entryId}/unqueue`
    );
    await getEntries(classValue);
  };

  const bumpToTop = async (entryId: number) => {
    try {
      // Get all currently queued entries and sort them by queued_at timestamp to preserve their exact order
      const queuedEntries = entries
        .filter((entry) => entry.queued_at)
        .sort((a, b) => {
          const aTime = new Date(a.queued_at!).getTime();
          const bTime = new Date(b.queued_at!).getTime();
          return aTime - bTime; // Sort by original queue order (FIFO)
        });

      // Unqueue all competitors
      for (const entry of queuedEntries) {
        await axios.post(
          `https://api.easyagility.co.uk/entries/${entry.id}/unqueue`
        );
      }

      // Requeue the bumped competitor first (at the top)
      await axios.post(
        `https://api.easyagility.co.uk/entries/${entryId}/queue`
      );

      // Requeue all other competitors in their EXACT original order
      for (const entry of queuedEntries) {
        if (entry.id !== entryId) {
          await axios.post(
            `https://api.easyagility.co.uk/entries/${entry.id}/queue`
          );
        }
      }

      await getEntries(classValue);
    } catch (error) {
      console.error("Error bumping entry to top:", error);
    }
  };

  const submitResult = async (entryId: number) => {
    setDisableSubmit(true);
    await axios.post(
      `https://api.easyagility.co.uk/entries/${entryId}/unqueue`
    );
    await axios.post(
      `https://api.easyagility.co.uk/entries/${entryId}/results`,
      {
        id: entryId,
        partnership: nextEntry.partnership,
        time: parseFloat(time),
        nfc_run: nfcRun,
        eliminated: eliminated,
        total_faults: faults.length * 5 + faults100.length * 100,
        run_data: faults,
        points: points,
      }
    );
    setTime("");
    setPoints([]);
    setEliminated(false);
    setNFCRun(false);
    setFaults([]);
    await getNextEntry();
    setDisableSubmit(false);
    setSubmitResultOpen(false);
  };

  // Note: DataGrid columns removed as we're now using a mobile-friendly card layout

  // Tab change handler
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    if (newValue === 0) {
      setScrime(true);
      setQueue(false);
    } else if (newValue === 1) {
      setQueue(true);
      setScrime(false);
    }
  };

  // Render warning for different class
  const renderClassWarning = () => {
    if (!nextEntry.last_result_class_different || nextEntry.id === 0)
      return null;

    return (
      <Card
        sx={{
          mb: 2,
          bgcolor: "#fff3cd",
          border: "1px solid #ffeaa7",
          mx: { xs: 0, md: 0 },
        }}
      >
        <CardContent sx={{ p: { xs: 1, md: 2 } }}>
          <Box display="flex" alignItems="center" mb={2}>
            <Warning color="warning" sx={{ mr: 1 }} />
            <Typography variant="h6" color="warning.dark">
              New Class Warning
            </Typography>
          </Box>
          <Typography variant="body1" color="warning.dark" mb={2}>
            The last entry was in a different class. Please review the details:
          </Typography>
          <Typography variant="h6" mb={2}>
            {nextEntry.class_name} - <strong>{nextEntry.partnership}</strong>
          </Typography>
          <Typography variant="body2" color="warning.dark" mb={3}>
            If this is correct, continue. If incorrect, ask the queuer to
            unqueue everyone in this class and return to the correct class on
            the queuer's device.
          </Typography>
          <Box display="flex" gap={2}>
            <Button
              variant="contained"
              color="success"
              onClick={() => {
                setNextEntry({
                  ...nextEntry,
                  last_result_class_different: false,
                });
              }}
            >
              Continue
            </Button>
            <Button variant="outlined" onClick={() => getNextEntry()}>
              Refresh
            </Button>
          </Box>
        </CardContent>
      </Card>
    );
  };

  // Render current competitor info
  const renderCurrentCompetitor = () => {
    if (!nextEntry.id || nextEntry.id === 0) {
      return (
        <Card sx={{ mb: 2, bgcolor: "#f8f9fa", mx: { xs: 0, md: 0 } }}>
          <CardContent sx={{ p: { xs: 1, md: 2 } }}>
            <Typography variant="h6" color="text.secondary" textAlign="center">
              No entries currently queued to run
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => getNextEntry()}
              sx={{ mt: 2 }}
            >
              Refresh
            </Button>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card sx={{ mb: 2, mx: { xs: 0, md: 0 } }}>
        <CardContent sx={{ p: { xs: 1, md: 2 } }}>
          {/* Compact Competitor Information */}
          <Box display="flex" alignItems="center" gap={2} mb={1}>
            {/* Small Competitor Avatar */}
            <Box
              sx={{
                width: 50,
                height: 50,
                borderRadius: "50%",
                border: "2px solid #1976d2",
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: nextEntry.picture_url ? "transparent" : "#f5f5f5",
                color: "#757575",
                fontSize: "20px",
                fontWeight: "bold",
              }}
            >
              {nextEntry.picture_url ? (
                <Box
                  component="img"
                  src={nextEntry.picture_url}
                  alt={`${nextEntry.partnership}`}
                  sx={{
                    width: "100%",
                    height: "100%",
                    borderRadius: "50%",
                    objectFit: "cover",
                  }}
                />
              ) : (
                // Default avatar with initials or icon
                nextEntry.partnership
                  ?.split(" ")
                  .map((name) => name[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2) || "?"
              )}
            </Box>

            {/* Compact Competitor Details */}
            <Box flex={1}>
              <Typography
                variant="h6"
                fontWeight="bold"
                color="primary"
                mb={0.5}
              >
                {nextEntry.partnership}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {nextEntry.class_name} • Entry #{nextEntry.id}
              </Typography>
            </Box>
          </Box>

          {/* Compact Status and Alerts */}
          <Box display="flex" gap={1} flexWrap="wrap" mb={1}>
            {eliminated && (
              <Chip
                label="Eliminated"
                color="error"
                icon={<Cancel />}
                size="small"
              />
            )}
            {nfcRun && (
              <Chip label="NFC" color="info" icon={<Speed />} size="small" />
            )}
            {nextEntry.partnership?.includes("Olivia Wood") && (
              <Chip
                label="Autistic"
                color="warning"
                size="small"
                variant="outlined"
              />
            )}
          </Box>
        </CardContent>
      </Card>
    );
  };

  // Render scoring interface based on class type
  const renderScoringInterface = () => {
    if (!nextEntry.id || nextEntry.id === 0) return null;

    const isSnooker = nextEntry.class_name.toLowerCase().includes("snooker");
    const isGamblers = nextEntry.class_name.toLowerCase().includes("gamblers");
    const isPairs = nextEntry.class_name.toLowerCase().includes("pairs");

    return (
      <Card sx={{ p: { xs: 0, md: 1 } }}>
        {" "}
        {/* No padding on mobile/tablet, minimal on laptop+ */}
        <CardContent sx={{ p: { xs: 1, md: 1 } }}>
          {" "}
          {/* Minimal padding */}
          <Typography variant="h6" mb={1} textAlign="center">
            Scoring
          </Typography>
          {/* Submit Button - Moved to top for easy access */}
          <Button
            fullWidth
            variant="contained"
            color="success"
            size="large"
            disabled={
              !nfcRun &&
              !eliminated &&
              (time === "" || time === "0" || time === "0.000")
            }
            onClick={() => setSubmitResultOpen(true)}
            sx={{ mb: 2, py: 2, fontSize: "1.2rem" }}
            startIcon={<CheckCircle />}
          >
            Submit Result
          </Button>
          {/* Time Input */}
          <TextField
            fullWidth
            variant="outlined"
            type="number"
            label="Competitor Time"
            value={time}
            onChange={handleChangeTime}
            sx={{ mb: 2 }}
            InputProps={{
              startAdornment: <Timer sx={{ mr: 1, color: "text.secondary" }} />,
            }}
          />
          {/* Class-specific scoring */}
          {isSnooker && renderSnookerScoring()}
          {isGamblers && renderGamblersScoring()}
          {!isSnooker && !isGamblers && renderStandardScoring()}
        </CardContent>
      </Card>
    );
  };

  // Render Snooker scoring
  const renderSnookerScoring = () => (
    <Box>
      <Typography variant="h6" mb={1} textAlign="center">
        Total Points: {points.reduce((sum, a) => sum + a, 0)}
      </Typography>
      <Typography variant="body2" mb={1} textAlign="center">
        Points: {points.join(", ")}
      </Typography>

      <Grid container spacing={1} mb={2}>
        {[1, 2, 3, 4, 5, 6, 7].map((point) => (
          <Grid item xs={3} key={point}>
            <Button
              variant="contained"
              disabled={eliminated}
              onClick={() => {
                const p = [...points];
                p.push(point);
                setPoints(p);
              }}
              sx={{
                bgcolor:
                  point === 1
                    ? "red"
                    : point === 2
                    ? "yellow"
                    : point === 3
                    ? "green"
                    : point === 4
                    ? "brown"
                    : point === 5
                    ? "blue"
                    : point === 6
                    ? "pink"
                    : "black",
                color: [2, 6].includes(point) ? "black" : "white",
                minHeight: "80px",
                fontSize: "1.5rem",
                fontWeight: "bold",
              }}
            >
              {point}
            </Button>
          </Grid>
        ))}
        <Grid item xs={3}>
          <Button
            variant="contained"
            color="error"
            disabled={eliminated}
            onClick={() => setEliminated(!eliminated)}
            sx={{ minHeight: "80px", fontSize: "1.5rem", fontWeight: "bold" }}
          >
            E
          </Button>
        </Grid>
      </Grid>

      <Button
        variant="outlined"
        onClick={() => {
          const p = [...points];
          p.pop();
          setPoints(p);
        }}
        fullWidth
        sx={{ py: 1.5, fontSize: "1.1rem" }}
      >
        Undo Last Point
      </Button>
    </Box>
  );

  // Render Gamblers scoring
  const renderGamblersScoring = () => (
    <Box>
      <Typography variant="h6" mb={1} textAlign="center">
        Total Points: {points.reduce((sum, a) => sum + a, 0)}
      </Typography>

      <TextField
        fullWidth
        variant="outlined"
        type="number"
        label="Points"
        value={points.reduce((sum, a) => sum + a, 0)}
        onChange={(e) => setPoints([parseInt(e.target.value) || 0])}
        sx={{ mb: 2 }}
      />

      {show?.classes?.find((c) => c.name === nextEntry.class_name)?.metadata?.[
        "gamblers_points"
      ] && (
        <Box sx={{ mb: 2 }}>
          {/* Mobile-friendly button grid - 2 columns on mobile, 4 on larger screens */}
          <Grid container spacing={1}>
            {Object.keys(
              show?.classes?.find((c) => c.name === nextEntry.class_name)
                ?.metadata?.["gamblers_points"]
            ).map((item, index) => (
              <Grid item xs={6} sm={3} key={index}>
                <Button
                  variant="contained"
                  onClick={() => {
                    setPoints([
                      ...points,
                      parseInt(
                        show?.classes?.find(
                          (c) => c.name === nextEntry.class_name
                        )?.metadata?.["gamblers_points"][item]
                      ),
                    ]);
                  }}
                  sx={{
                    bgcolor: (() => {
                      const pointValue = show?.classes?.find(
                        (c) => c.name === nextEntry.class_name
                      )?.metadata?.["gamblers_points"][item];
                      return pointValue === 5
                        ? "green"
                        : pointValue === 4
                        ? "orange"
                        : pointValue === 2
                        ? "blue"
                        : pointValue === 1
                        ? "purple"
                        : "black";
                    })(),
                    minHeight: { xs: "60px", md: "80px" },
                    fontSize: { xs: "1.2rem", md: "1.5rem" },
                    fontWeight: "bold",
                    width: "100%",
                  }}
                >
                  {item}
                </Button>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Action buttons with mobile-friendly sizing */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <Button
          variant="contained"
          color="error"
          onClick={() => setEliminated(!eliminated)}
          sx={{
            minHeight: { xs: "60px", md: "80px" },
            fontSize: { xs: "1.2rem", md: "1.5rem" },
            fontWeight: "bold",
          }}
          fullWidth
        >
          {eliminated ? "Undo Elimination" : "Eliminated"}
        </Button>

        <Button
          variant="outlined"
          onClick={() => {
            const p = [...points];
            p.pop();
            setPoints(p);
          }}
          fullWidth
          sx={{
            py: { xs: 1, md: 1.5 },
            fontSize: { xs: "1rem", md: "1.1rem" },
            minHeight: { xs: "48px", md: "56px" },
          }}
        >
          Undo Last Point
        </Button>
      </Box>
    </Box>
  );

  // Render standard scoring
  const renderStandardScoring = () => (
    <Box>
      {!eliminated && (
        <Typography variant="h6" mb={1} textAlign="center">
          Faults:{" "}
          {faults.length === 0 && faults100.length === 0
            ? "None"
            : faults.join(", ") + " " + faults100.join(", ")}
        </Typography>
      )}

      <Grid container spacing={1} mb={2}>
        <Grid item xs={6}>
          <Button
            variant="contained"
            onClick={() => setFaults([...faults, "R"])}
            sx={{
              bgcolor: "green",
              minHeight: "100px",
              fontSize: "2rem",
              fontWeight: "bold",
            }}
            fullWidth
          >
            R
          </Button>
        </Grid>
        <Grid item xs={6}>
          <Button
            variant="contained"
            onClick={() => setFaults([...faults, "5"])}
            sx={{
              bgcolor: "green",
              minHeight: "100px",
              fontSize: "2rem",
              fontWeight: "bold",
            }}
            fullWidth
          >
            5
          </Button>
        </Grid>

        {nextEntry.class_name.toLowerCase().includes("pairs") && (
          <Grid item xs={12}>
            <Button
              variant="contained"
              onClick={() => setFaults100([...faults100, "100"])}
              sx={{
                bgcolor: "green",
                minHeight: "100px",
                fontSize: "2rem",
                fontWeight: "bold",
              }}
              fullWidth
            >
              100F
            </Button>
          </Grid>
        )}

        <Grid item xs={6}>
          <Button
            variant="contained"
            onClick={() => setFaults([...faults, "H"])}
            sx={{
              bgcolor: "gray",
              color: "white",
              minHeight: "100px",
              fontSize: "2rem",
              fontWeight: "bold",
            }}
            fullWidth
          >
            H
          </Button>
        </Grid>
        <Grid item xs={6}>
          <Button
            variant="contained"
            onClick={() => setNFCRun(!nfcRun)}
            sx={{
              bgcolor: "blue",
              minHeight: "100px",
              fontSize: "1.8rem",
              fontWeight: "bold",
            }}
            fullWidth
          >
            {nfcRun ? "Undo NFC" : "NFC"}
          </Button>
        </Grid>

        <Grid item xs={12}>
          <Button
            variant="contained"
            onClick={() => setEliminated(!eliminated)}
            sx={{
              bgcolor: "red",
              minHeight: "100px",
              fontSize: "2rem",
              fontWeight: "bold",
            }}
            fullWidth
          >
            {eliminated ? "Undo Eliminated" : "Eliminated"}
          </Button>
        </Grid>
      </Grid>

      <Button
        variant="outlined"
        onClick={() => {
          const f = [...faults];
          f.pop();
          setFaults(f);
        }}
        fullWidth
        sx={{ py: 1.5, fontSize: "1.1rem" }}
      >
        Undo Last Fault
      </Button>

      {nextEntry.class_name.toLowerCase().includes("pairs") && (
        <Button
          variant="outlined"
          onClick={() => {
            const f = [...faults100];
            f.pop();
            setFaults100(f);
          }}
          fullWidth
          sx={{ py: 1.5, fontSize: "1.1rem" }}
        >
          Undo Last 100 Fault
        </Button>
      )}
    </Box>
  );

  // Render queue management
  const renderQueueManagement = () => (
    <Box>
      {classValue === 0 ? (
        <Card>
          <CardContent>
            <Typography variant="h6" mb={3} textAlign="center">
              Please select a class to view the queue
            </Typography>
            <FormControl fullWidth>
              <InputLabel>Select A Class</InputLabel>
              <Select
                value={classValue}
                onChange={(e) => {
                  setClassValue(e.target.value as any);
                  const heightGrades = show.classes.find(
                    (c) => c.id === e.target.value
                  )?.height_grades;
                  const heights = Object.keys(heightGrades);
                  setHeights(heights);
                  setHeight(heights[0]);
                  getEntries(e.target.value as any);
                }}
                label="Select A Class"
              >
                {show?.classes?.map((c: C, index: number) => (
                  <MenuItem key={index} value={c.id}>
                    {c.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </CardContent>
        </Card>
      ) : (
        <Box>
          <Card sx={{ mb: 2, mx: { xs: 0, md: 0 } }}>
            <CardContent sx={{ p: { xs: 1, md: 2 } }}>
              <Typography variant="h6" mb={2}>
                Queue - {show?.classes?.find((c) => c.id === classValue)?.name}
              </Typography>

              <Box display="flex" gap={1} flexWrap="wrap">
                <Button
                  variant="contained"
                  onClick={() => setClassDetailsOpen(true)}
                  startIcon={<Settings />}
                >
                  Course Details
                </Button>
                <Button
                  variant="contained"
                  color="warning"
                  onClick={() => setCloseClassOpen(true)}
                  startIcon={<Cancel />}
                >
                  Close Class
                </Button>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => setSendMessageOpen(true)}
                  startIcon={<Score />}
                >
                  PA Announcement
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => {
                    setClassValue(0);
                    setHeight("");
                  }}
                >
                  Exit Class
                </Button>
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ mb: 2, mx: { xs: 0, md: 0 } }}>
            <CardContent sx={{ p: { xs: 1, md: 2 } }}>
              <FormControl fullWidth>
                <InputLabel>Select A Height</InputLabel>
                <Select
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  label="Select A Height"
                >
                  {heights.map((height, index) => (
                    <MenuItem key={index} value={height}>
                      {height}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </CardContent>
          </Card>

          {/* Mobile-friendly queue entries */}
          <Box>
            {entries && entries.length > 0 ? (
              // Sort entries: queued first (in queue order), then not queued, then completed runs
              [...entries]
                .sort((a, b) => {
                  // Check if entry has completed a run
                  const aCompleted = !!(a.time || a.eliminated || a.nfc_run);
                  const bCompleted = !!(b.time || b.eliminated || b.nfc_run);

                  // Check if entry is queued
                  const aQueued = !!a.queued_at;
                  const bQueued = !!b.queued_at;

                  // Priority order: queued > not queued > completed
                  if (aQueued && !bQueued) return -1;
                  if (!aQueued && bQueued) return 1;
                  if (aCompleted && !bCompleted) return 1;
                  if (!aCompleted && bCompleted) return -1;

                  // For queued entries, sort by queued_at timestamp (FIFO order)
                  if (aQueued && bQueued) {
                    const aTime = new Date(a.queued_at!).getTime();
                    const bTime = new Date(b.queued_at!).getTime();
                    return aTime - bTime; // Earlier timestamp (first queued) comes first
                  }

                  // Maintain original order within same priority group
                  return 0;
                })
                .map((entry, index) => {
                  const isQueued = !!entry.queued_at;
                  const isCompleted = !!(
                    entry.time ||
                    entry.eliminated ||
                    entry.nfc_run
                  );

                  return (
                    <Card
                      key={entry.id}
                      sx={{
                        mb: 2,
                        mx: { xs: 0, md: 0 },
                        border: isQueued
                          ? "2px solid #1976d2"
                          : "1px solid #e0e0e0",
                        bgcolor: isQueued
                          ? "#f3f8ff"
                          : isCompleted
                          ? "#fafafa"
                          : "white",
                        position: "relative",
                      }}
                    >
                      {/* Queued indicator banner */}
                      {isQueued && (
                        <Box
                          sx={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            bgcolor: "#1976d2",
                            color: "white",
                            py: 0.5,
                            px: 2,
                            textAlign: "center",
                            fontSize: "0.75rem",
                            fontWeight: "bold",
                            borderTopLeftRadius: "4px",
                            borderTopRightRadius: "4px",
                          }}
                        >
                          🎯 QUEUED - READY TO RUN
                        </Box>
                      )}

                      <CardContent
                        sx={{ pt: isQueued ? 4 : 2, px: { xs: 1, md: 2 } }}
                      >
                        <Box
                          display="flex"
                          justifyContent="space-between"
                          alignItems="flex-start"
                          mb={2}
                        >
                          <Box flex={1}>
                            <Box display="flex" alignItems="center" gap={2}>
                              {/* Competitor Picture or Default Avatar */}
                              <Box
                                sx={{
                                  width: 60,
                                  height: 60,
                                  borderRadius: "50%",
                                  border: "2px solid #e0e0e0",
                                  flexShrink: 0,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  bgcolor: entry.picture_url
                                    ? "transparent"
                                    : "#f5f5f5",
                                  color: "#757575",
                                  fontSize: "24px",
                                  fontWeight: "bold",
                                }}
                              >
                                {entry.picture_url ? (
                                  <Box
                                    component="img"
                                    src={entry.picture_url}
                                    alt={`${entry.partnership}`}
                                    sx={{
                                      width: "100%",
                                      height: "100%",
                                      borderRadius: "50%",
                                      objectFit: "cover",
                                    }}
                                  />
                                ) : (
                                  // Default avatar with initials or icon
                                  entry.partnership
                                    ?.split(" ")
                                    .map((name) => name[0])
                                    .join("")
                                    .toUpperCase()
                                    .slice(0, 2) || "?"
                                )}
                              </Box>

                              {/* Competitor Information */}
                              <Box>
                                <Typography
                                  variant="h6"
                                  fontWeight="bold"
                                  color={isQueued ? "#1976d2" : "inherit"}
                                >
                                  {entry.partnership}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  Entry #{entry.id}
                                </Typography>
                                {isQueued && (
                                  <Typography
                                    variant="body2"
                                    color="primary"
                                    fontWeight="bold"
                                    mt={0.5}
                                  >
                                    ⏰ Queued at:{" "}
                                    {new Date(
                                      entry.queued_at!
                                    ).toLocaleTimeString()}
                                  </Typography>
                                )}
                              </Box>
                            </Box>
                          </Box>
                          <Box
                            display="flex"
                            gap={1}
                            flexDirection="column"
                            alignItems="flex-end"
                          >
                            {/* Status chips */}
                            {isQueued && (
                              <Chip
                                label="QUEUED"
                                color="primary"
                                size="small"
                                icon={<Queue />}
                                sx={{ fontWeight: "bold" }}
                              />
                            )}
                            {!isQueued && !isCompleted && (
                              <Chip
                                label="NOT QUEUED"
                                color="default"
                                size="small"
                                variant="outlined"
                              />
                            )}
                            {entry.time && (
                              <Chip
                                label={`Time: ${entry.time}s`}
                                color="success"
                                size="small"
                                icon={<Timer />}
                              />
                            )}
                            {entry.eliminated && (
                              <Chip
                                label="Eliminated"
                                color="error"
                                size="small"
                                icon={<Cancel />}
                              />
                            )}
                            {entry.nfc_run && (
                              <Chip
                                label="NFC"
                                color="info"
                                size="small"
                                icon={<Speed />}
                              />
                            )}
                          </Box>
                        </Box>

                        {/* Action buttons */}
                        <Box display="flex" gap={1} flexWrap="wrap">
                          {/* Primary Action Button */}
                          <Button
                            variant={isQueued ? "contained" : "outlined"}
                            color={
                              isQueued
                                ? "primary"
                                : isCompleted
                                ? "error"
                                : "success"
                            }
                            onClick={() => {
                              setQueuedEntry(entry);
                              setQueueConfirmOpen(true);
                            }}
                            sx={{
                              flex: 2,
                              minHeight: "48px",
                              fontSize: "0.9rem",
                              fontWeight: "bold",
                            }}
                            startIcon={isQueued ? <Cancel /> : <Queue />}
                          >
                            {isQueued ? "Unqueue" : "Queue"}
                          </Button>

                          {/* Secondary Action Button */}
                          <Button
                            variant="outlined"
                            color="secondary"
                            onClick={() => {
                              setChangeHandlerName(true);
                              setNewHandlerName("");
                              setEntryId(entry.id);
                            }}
                            sx={{
                              flex: 1,
                              minHeight: "48px",
                              fontSize: "0.85rem",
                            }}
                          >
                            Handler
                          </Button>

                          {/* Bump to Top Button - Only show for queued entries */}
                          {isQueued && (
                            <Button
                              variant="outlined"
                              color="warning"
                              onClick={() => {
                                setBumpEntry(entry);
                                setBumpConfirmOpen(true);
                              }}
                              sx={{
                                flex: 1,
                                minHeight: "48px",
                                fontSize: "0.85rem",
                              }}
                              startIcon={<PlayArrow />}
                            >
                              Bump
                            </Button>
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  );
                })
            ) : (
              <Card sx={{ bgcolor: "#f8f9fa", mx: { xs: 0, md: 0 } }}>
                <CardContent sx={{ p: { xs: 1, md: 2 } }}>
                  <Typography
                    variant="h6"
                    color="text.secondary"
                    textAlign="center"
                  >
                    No entries found for this class and height
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    mt={1}
                    textAlign="center"
                  >
                    Select a different class or height, or check if entries
                    exist
                  </Typography>
                </CardContent>
              </Card>
            )}
          </Box>
        </Box>
      )}
    </Box>
  );

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        bgcolor: "#cfd8e3",
      }}
    >
      <CssBaseline />

      {/* App Bar */}
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Easy Agility Admin
          </Typography>
          <IconButton color="inherit" onClick={() => getNextEntry()}>
            <Refresh />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container
        maxWidth="lg"
        sx={{
          flexGrow: 1,
          py: { xs: 0, md: 2 },
          px: { xs: 0, md: 2 },
          bgcolor: "#cfd8e3",
        }}
      >
        {/* Tab Navigation */}
        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="fullWidth"
          >
            <Tab label="Scrime" icon={<PlayArrow />} iconPosition="start" />
            <Tab label="Queue" icon={<Queue />} iconPosition="start" />
          </Tabs>
        </Box>

        {/* Tab Panels */}
        <TabPanel value={activeTab} index={0}>
          <Box>
            {renderClassWarning()}
            {renderCurrentCompetitor()}
            {renderScoringInterface()}
          </Box>
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          {renderQueueManagement()}
        </TabPanel>
      </Container>

      {/* Modals */}
      {/* Submit Result Modal */}
      <Modal open={submitResultOpen} onClose={() => setSubmitResultOpen(false)}>
        <Box sx={modalStyle}>
          <Typography variant="h6" component="h2" mb={2}>
            Submit This Result
          </Typography>
          <Typography mb={2}>
            Are you sure you want to submit this result?
          </Typography>
          <Typography fontWeight="bold" mb={3}>
            Time: {time}
          </Typography>
          <Box display="flex" gap={2}>
            <Button
              onClick={() => submitResult(nextEntry.id)}
              disabled={disableSubmit}
              variant="contained"
              color="success"
              fullWidth
            >
              Confirm
            </Button>
            <Button
              onClick={() => setSubmitResultOpen(false)}
              variant="outlined"
              color="error"
              fullWidth
            >
              Cancel
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Queue Confirm Modal */}
      <Modal open={queueConfirmOpen} onClose={() => setQueueConfirmOpen(false)}>
        <Box sx={modalStyle}>
          <Typography variant="h6" component="h2" mb={2}>
            {queuedEntry.queued_at ? "Unqueue" : "Queue"} This Entry
          </Typography>

          {/* Competitor Avatar and Information */}
          <Box display="flex" alignItems="center" gap={2} mb={3}>
            {/* Competitor Picture or Default Avatar */}
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                border: "2px solid #e0e0e0",
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: queuedEntry.picture_url ? "transparent" : "#f5f5f5",
                color: "#757575",
                fontSize: "32px",
                fontWeight: "bold",
              }}
            >
              {queuedEntry.picture_url ? (
                <Box
                  component="img"
                  src={queuedEntry.picture_url}
                  alt={`${queuedEntry.partnership}`}
                  sx={{
                    width: "100%",
                    height: "100%",
                    borderRadius: "50%",
                    objectFit: "cover",
                  }}
                />
              ) : (
                // Default avatar with initials or icon
                queuedEntry.partnership
                  ?.split(" ")
                  .map((name) => name[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2) || "?"
              )}
            </Box>

            {/* Competitor Details */}
            <Box>
              <Typography variant="h5" fontWeight="bold" color="primary">
                {queuedEntry.partnership}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Entry #{queuedEntry.id}
              </Typography>
              {queuedEntry.queued_at && (
                <Typography
                  variant="body2"
                  color="primary"
                  fontWeight="bold"
                  mt={0.5}
                >
                  ⏰ Currently Queued
                </Typography>
              )}
            </Box>
          </Box>

          {queuedEntry.time || queuedEntry.eliminated || queuedEntry.nfc_run ? (
            <Alert severity="warning" sx={{ mb: 2 }}>
              WARNING: THIS PERSON HAS ALREADY RUN IN THIS CLASS. PLEASE MAKE
              SURE YOU ARE CERTAIN.
            </Alert>
          ) : null}
          <Typography mb={2}>
            Are you sure you want to{" "}
            {queuedEntry.queued_at ? "unqueue" : "queue"}{" "}
            {queuedEntry.partnership}?
          </Typography>
          {queuedEntry.partnership?.includes("Olivia Wood") && (
            <Alert severity="info" sx={{ mb: 2 }}>
              ***Please note this competitor is autistic.***
            </Alert>
          )}
          <Box display="flex" gap={2}>
            <Button
              onClick={() => {
                setQueuedEntry({} as Entry);
                setQueueConfirmOpen(false);
              }}
              variant="outlined"
              color="error"
              fullWidth
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                queuedEntry.queued_at
                  ? unqueueEntry(queuedEntry.id)
                  : queueEntry(queuedEntry.id);
                setQueuedEntry({} as Entry);
                setQueueConfirmOpen(false);
              }}
              variant="contained"
              color="success"
              fullWidth
            >
              Confirm
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Close Class Modal */}
      <Modal open={closeClassOpen} onClose={() => setCloseClassOpen(false)}>
        <Box sx={modalStyle}>
          <Typography variant="h6" component="h2" mb={2}>
            Close This Class
          </Typography>
          <Typography mb={3}>
            Are you sure you want to close this class?
          </Typography>
          <Box display="flex" gap={2}>
            <Button
              onClick={() => setCloseClassOpen(false)}
              variant="outlined"
              color="error"
              fullWidth
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                closeClass();
                setCloseClassOpen(false);
              }}
              variant="contained"
              color="warning"
              fullWidth
            >
              Confirm
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Send Message Modal */}
      <Modal open={sendMessageOpen} onClose={() => setSendMessageOpen(false)}>
        <Box sx={modalStyle}>
          <Typography variant="h6" component="h2" mb={2}>
            Send PA Message
          </Typography>
          <TextField
            fullWidth
            name="message"
            label="Message"
            variant="outlined"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            sx={{ mb: 2 }}
          />

          <Box display="flex" flexDirection="column" gap={1} mb={3}>
            {[
              "Calling to 20",
              "Calling to 40",
              "Calling all remaining dogs",
              "Closing in 5 minutes",
              "Walking now, starting in 5 minutes",
              "Walking now, starting in 10 minutes",
              "Walking now, starting in 15 minutes",
            ].map((msg, index) => (
              <Button
                key={index}
                variant="outlined"
                size="small"
                onClick={() => setMessage(msg)}
                sx={{ justifyContent: "flex-start" }}
              >
                {msg}
              </Button>
            ))}
          </Box>

          <Box display="flex" gap={2}>
            <Button
              onClick={() => setSendMessageOpen(false)}
              variant="outlined"
              color="error"
              fullWidth
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                setClassMessage();
                setMessage("");
                setSendMessageOpen(false);
              }}
              variant="contained"
              color="success"
              fullWidth
            >
              Send
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Class Details Modal */}
      <Modal
        open={classDetailsOpen && activeTab === 1}
        onClose={() => setClassDetailsOpen(false)}
      >
        <Box sx={modalStyle}>
          <Typography variant="h6" component="h2" mb={2}>
            Add Course Time and Distance
          </Typography>
          <TextField
            fullWidth
            name="course_time"
            label="Course Time (seconds)"
            variant="outlined"
            type="number"
            value={courseTime}
            onChange={handleChange}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            name="course_distance"
            label="Course Distance (metres)"
            type="number"
            variant="outlined"
            value={courseDistance}
            onChange={handleChange}
            sx={{ mb: 3 }}
          />
          <Box display="flex" gap={2}>
            <Button
              onClick={updateClassDetails}
              variant="contained"
              color="success"
              fullWidth
            >
              Confirm
            </Button>
            <Button
              onClick={() => setClassDetailsOpen(false)}
              variant="outlined"
              color="error"
              fullWidth
            >
              Close
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Change Handler Name Modal */}
      <Modal
        open={changeHandlerName}
        onClose={() => setChangeHandlerName(false)}
      >
        <Box sx={modalStyle}>
          <Typography variant="h6" component="h2" mb={2}>
            Change Handler Name
          </Typography>
          <TextField
            fullWidth
            name="handler_name"
            label="New Handler Name"
            variant="outlined"
            value={newHandlerName}
            onChange={(e) => setNewHandlerName(e.target.value)}
            sx={{ mb: 3 }}
          />
          <Box display="flex" gap={2}>
            <Button
              onClick={() => {
                changeHandlerNameReq();
                setChangeHandlerName(false);
                setNewHandlerName("");
                getEntries(classValue);
              }}
              variant="contained"
              color="success"
              fullWidth
            >
              Confirm
            </Button>
            <Button
              onClick={() => setChangeHandlerName(false)}
              variant="outlined"
              color="error"
              fullWidth
            >
              Cancel
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Bump to Top Confirmation Modal */}
      <Modal open={bumpConfirmOpen} onClose={() => setBumpConfirmOpen(false)}>
        <Box sx={modalStyle}>
          <Typography variant="h6" component="h2" mb={2}>
            Bump to Top of Queue
          </Typography>

          {/* Competitor Avatar and Information */}
          <Box display="flex" alignItems="center" gap={2} mb={3}>
            {/* Competitor Picture or Default Avatar */}
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                border: "2px solid #e0e0e0",
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: bumpEntry.picture_url ? "transparent" : "#f5f5f5",
                color: "#757575",
                fontSize: "32px",
                fontWeight: "bold",
              }}
            >
              {bumpEntry.picture_url ? (
                <Box
                  component="img"
                  src={bumpEntry.picture_url}
                  alt={`${bumpEntry.partnership}`}
                  sx={{
                    width: "100%",
                    height: "100%",
                    borderRadius: "50%",
                    objectFit: "cover",
                  }}
                />
              ) : (
                // Default avatar with initials or icon
                bumpEntry.partnership
                  ?.split(" ")
                  .map((name) => name[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2) || "?"
              )}
            </Box>

            {/* Competitor Details */}
            <Box>
              <Typography variant="h5" fontWeight="bold" color="warning.main">
                {bumpEntry.partnership}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Entry #{bumpEntry.id}
              </Typography>
              <Typography
                variant="body2"
                color="warning.main"
                fontWeight="bold"
                mt={0.5}
              >
                ⚡ Will be moved to TOP of queue
              </Typography>
            </Box>
          </Box>

          <Typography mb={2}>
            Are you sure you want to move{" "}
            <strong>{bumpEntry.partnership}</strong> to the top of the queue?
          </Typography>

          <Typography variant="body2" color="text.secondary" mb={3}>
            This will temporarily unqueue all competitors, then requeue{" "}
            <strong>{bumpEntry.partnership}</strong> first, followed by all
            other queued competitors in their original order.
          </Typography>

          <Box display="flex" gap={2}>
            <Button
              onClick={() => setBumpConfirmOpen(false)}
              variant="outlined"
              color="error"
              fullWidth
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                bumpToTop(bumpEntry.id);
                setBumpConfirmOpen(false);
                setBumpEntry({} as Entry);
              }}
              variant="contained"
              color="warning"
              fullWidth
            >
              Bump to Top
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity="success"
          sx={{ width: "100%" }}
        >
          League points have been generated for this class
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default App;
