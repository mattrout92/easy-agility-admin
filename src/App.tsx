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
} from "@mui/material";
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
  queued_at?: string;
  partnership?: string;
  time?: number;
  nfc_run?: boolean;
  eliminated?: boolean;
  total_faults?: number;
  run_data?: string[];
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

const showID = 24;
const ringId = 2;

function App() {
  const [faults, setFaults] = useState<string[]>([]);
  const [eliminated, setEliminated] = useState<boolean>(false);
  const [nfcRun, setNFCRun] = useState<boolean>(false);
  const [time, setTime] = useState<string>("");
  const [points, setPoints] = useState<number[]>([]);
  const [queue, setQueue] = useState<boolean>(false);
  const [scrime, setScrime] = useState<boolean>(false);
  const [classValue, setClassValue] = useState<number>(0);
  const [height, setHeight] = useState<string>("");
  const [entries, setEntries] = useState<Entry[]>([]);
  const [queueConfirmOpen, setQueueConfirmOpen] = useState<boolean>(false);
  const [classDetailsOpen, setClassDetailsOpen] = useState<boolean>(false);
  const [submitResultOpen, setSubmitResultOpen] = useState<boolean>(false);
  const [courseDistance, setCourseDistance] = useState<number>(0);
  const [courseTime, setCourseTime] = useState<number>(0);
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [closeClassOpen, setCloseClassOpen] = useState<boolean>(false);
  const [sendMessageOpen, setSendMessageOpen] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [changeHandlerName, setChangeHandlerName] = useState<boolean>(false);
  const [newHandlerName, setNewHandlerName] = useState<string>("");
  const [entryId, setEntryId] = useState<number>(0);

  const [queuedEntry, setQueuedEntry] = useState<Entry>({} as Entry);
  const [nextEntry, setNextEntry] = useState<Entry>({} as Entry);
  const [show, setShow] = useState<Show>({} as Show);
  const [heights, setHeights] = useState<string[]>([]);

  useEffect(() => {
    checkCourseDetails();
    getEntries();
    // eslint-disable-next-line
  }, [height, classValue]);

  useEffect(() => {
    getShow();
    getNextEntry();
    // eslint-disable-next-line
  }, []);

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
    const c = show?.classes?.find((c) => c.id === classValue);

    console.log(c?.metadata);

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
      `https://api.easyagility.co.uk/shows/${showID}&ring_id=${ringId}`
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

      console.log(response.data?.classes[0]);

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

  const generateLeaguePoints = async () => {
    try {
      const heightGrades = show.classes.find((c) => c.id === classValue)
        ?.height_grades as any;
      const grades = heightGrades[height];

      for (const g of grades) {
        await axios.post(
          `https://api.easyagility.co.uk/shows/${showID}/classes/${classValue}/league-points?height=${encodeURIComponent(
            height
          )}&grades=${encodeURIComponent(g.join(","))}`
        );
      }
      setSnackbarOpen(true);
    } catch (e) {
      console.log(e);
    }
  };

  const getNextEntry = async () => {
    const response = await axios.get(
      `https://api.easyagility.co.uk/shows/${showID}/entries/next?ring_id=${ringId}`
    );

    setNextEntry(response.data);
  };

  const getEntries = async () => {
    const response = await axios.get(
      `https://api.easyagility.co.uk/shows/${showID}/classes/${classValue}/entries?height=${encodeURIComponent(
        height
      )}}`
    );

    setEntries(response.data);
  };

  useEffect(() => {
    const interval = setInterval(() => getEntries(), 30000);
    return () => {
      clearInterval(interval);
    };
  }, [classValue, height]);

  const queueEntry = async (entryId: number) => {
    await axios.post(`https://api.easyagility.co.uk/entries/${entryId}/queue`);
    await getEntries();
  };

  const unqueueEntry = async (entryId: number) => {
    await axios.post(
      `https://api.easyagility.co.uk/entries/${entryId}/unqueue`
    );
    await getEntries();
  };

  const submitResult = async (entryId: number) => {
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
        total_faults: faults.length * 5,
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

    setSubmitResultOpen(false);
  };

  const columns = [
    {
      field: "partnership",
      headerName: "Entry",
      width: "150",
      renderCell: (params: any) => {
        return (
          <Box
            sx={{
              maxHeight: "inherit",
              width: "100%",
              whiteSpace: "initial",
              lineHeight: "16px",
            }}
          >
            {params.value}
          </Box>
        );
      },
    },
    {
      type: "actions",
      width: 200,
      getActions: (params: any) => {
        return [
          <>
            <Button
              fullWidth
              variant="outlined"
              color={
                params.row.queued_at
                  ? "primary"
                  : params.row.time ||
                    params.row.eliminated ||
                    params.row?.nfc_run
                  ? "error"
                  : "success"
              }
              onClick={() => {
                setQueuedEntry(params.row);
                setQueueConfirmOpen(true);
              }}
            >
              {params.row.queued_at ? "Unqueue" : "Queue"}
            </Button>
          </>,
        ];
      },
    },
    {
      field: "time",
      headerName: "Run?",
      type: "boolean",
      valueGetter: ({ value, row }: any) =>
        value ? true : row?.eliminated ? true : row?.nfc_run ? true : false,
    },
    {
      field: "",
      width: 400,
      renderCell: (params: any) => {
        return [
          <>
            <Button
              variant="outlined"
              color={"success"}
              onClick={() => {
                setChangeHandlerName(true);
                setNewHandlerName("");
                setEntryId(params.row.id);
              }}
            >
              Change Handler Name
            </Button>
          </>,
        ];
      },
    },
  ];

  return (
    <Box sx={{ display: "flex", textAlign: "center" }}>
      <CssBaseline />

      {scrime ? (
        <Grid padding={2} container spacing={2} rowSpacing={3}>
          <Grid item xs={12}>
            <Button
              onClick={() => {
                getNextEntry();
                setScrime(false);
                setQueue(true);
              }}
              fullWidth
              color="secondary"
              variant="contained"
            >
              Go To Queue
            </Button>
          </Grid>
          {nextEntry.id && nextEntry.id !== 0 ? (
            <>
              <Grid item xs={12}>
                <Typography variant="h6">
                  {nextEntry.class_name} - {nextEntry.partnership}
                </Typography>
              </Grid>

              {eliminated && (
                <Grid item xs={12}>
                  <Typography color="red" variant="h6">
                    Eliminated
                  </Typography>
                </Grid>
              )}
              {nfcRun && (
                <Grid item xs={12}>
                  <Typography variant="h6">NFC</Typography>
                </Grid>
              )}

              {nextEntry.class_name.toLowerCase().includes("snooker") ? (
                <>
                  <Grid item xs={12}>
                    <Typography variant="h5">
                      Total Points -{" "}
                      {points.reduce((partialSum, a) => partialSum + a, 0)}
                    </Typography>
                    <Typography variant="h6">
                      Points - {points.join(", ")}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      variant="outlined"
                      type="number"
                      label="Competitor Time"
                      value={time}
                      onChange={(e) => {
                        try {
                          setTime(e.target.value);
                        } catch (e) {}
                      }}
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <Button
                      onClick={() => {
                        const p = [...points];
                        p.push(1);
                        setPoints(p);
                      }}
                      fullWidth
                      disabled={eliminated}
                      variant="contained"
                      sx={{ bgcolor: "red" }}
                    >
                      1
                    </Button>
                  </Grid>
                  <Grid item xs={3}>
                    <Button
                      onClick={() => {
                        const p = [...points];
                        p.push(2);
                        setPoints(p);
                      }}
                      disabled={eliminated}
                      fullWidth
                      variant="contained"
                      sx={{ bgcolor: "yellow", color: "black" }}
                    >
                      2
                    </Button>
                  </Grid>
                  <Grid item xs={3}>
                    <Button
                      onClick={() => {
                        const p = [...points];
                        p.push(3);
                        setPoints(p);
                      }}
                      disabled={eliminated}
                      fullWidth
                      variant="contained"
                      sx={{ bgcolor: "green" }}
                    >
                      3
                    </Button>
                  </Grid>
                  <Grid item xs={3}>
                    <Button
                      onClick={() => {
                        const p = [...points];
                        p.push(4);
                        setPoints(p);
                      }}
                      disabled={eliminated}
                      fullWidth
                      variant="contained"
                      sx={{ bgcolor: "brown" }}
                    >
                      4
                    </Button>
                  </Grid>
                  <Grid item xs={3}>
                    <Button
                      onClick={() => {
                        const p = [...points];
                        p.push(5);
                        setPoints(p);
                      }}
                      disabled={eliminated}
                      fullWidth
                      variant="contained"
                      sx={{ bgcolor: "blue" }}
                    >
                      5
                    </Button>
                  </Grid>
                  <Grid item xs={3}>
                    <Button
                      onClick={() => {
                        const p = [...points];
                        p.push(6);
                        setPoints(p);
                      }}
                      disabled={eliminated}
                      fullWidth
                      variant="contained"
                      sx={{ bgcolor: "pink", color: "black" }}
                    >
                      6
                    </Button>
                  </Grid>
                  <Grid item xs={3}>
                    <Button
                      onClick={() => {
                        const p = [...points];
                        p.push(7);
                        setPoints(p);
                      }}
                      disabled={eliminated}
                      fullWidth
                      variant="contained"
                      sx={{ bgcolor: "black" }}
                    >
                      7
                    </Button>
                  </Grid>
                  <Grid item xs={3}>
                    <Button
                      onClick={() => {
                        setEliminated(!eliminated);
                      }}
                      fullWidth
                      variant="contained"
                      color="error"
                    >
                      E
                    </Button>
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      onClick={() => {
                        const p = [...points];
                        p.pop();
                        setPoints(p);
                      }}
                      fullWidth
                      variant="contained"
                    >
                      UNDO
                    </Button>
                  </Grid>
                </>
              ) : nextEntry.class_name.toLowerCase().includes("gamblers") ? (
                <>
                  <Grid item xs={12}>
                    <Typography variant="h5">
                      Total Points -{" "}
                      {points.reduce((partialSum, a) => partialSum + a, 0)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      variant="outlined"
                      type="number"
                      label="Competitor Time"
                      value={time}
                      onChange={(e) => {
                        try {
                          setTime(e.target.value);
                        } catch (e) {}
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      variant="outlined"
                      type="number"
                      label="Points"
                      value={points.reduce(
                        (partialSum, a) => partialSum + a,
                        0
                      )}
                      onChange={(e) => {
                        setPoints([parseInt(e.target.value) || 0]);
                      }}
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <Button
                      onClick={() => {
                        setEliminated(!eliminated);
                      }}
                      fullWidth
                      variant="contained"
                      color="error"
                    >
                      E
                    </Button>
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      onClick={() => {
                        const p = [...points];
                        p.pop();
                        setPoints(p);
                      }}
                      fullWidth
                      variant="contained"
                    >
                      UNDO
                    </Button>
                  </Grid>
                </>
              ) : (
                <>
                  {!eliminated && (
                    <Grid item xs={12}>
                      <Typography variant="h6">
                        Faults:{" "}
                        {faults.length === 0 ? "None" : faults.join(", ")}
                      </Typography>
                    </Grid>
                  )}

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      variant="outlined"
                      type="number"
                      label="Competitor Time"
                      value={time}
                      onChange={(e) => {
                        try {
                          setTime(e.target.value);
                        } catch (e) {}
                      }}
                    />
                  </Grid>

                  <Grid item xs={6}>
                    <Button
                      onClick={() => {
                        setFaults([...faults, "R"]);
                      }}
                      fullWidth
                      variant="contained"
                      sx={{
                        bgcolor: "green",
                        minHeight: "100px",
                        fontSize: 30,
                      }}
                    >
                      R
                    </Button>
                  </Grid>
                  <Grid item xs={6}>
                    <Button
                      onClick={() => {
                        setFaults([...faults, "5"]);
                      }}
                      fullWidth
                      variant="contained"
                      sx={{
                        bgcolor: "green",
                        minHeight: "100px",
                        fontSize: 30,
                      }}
                    >
                      5
                    </Button>
                  </Grid>
                  <Grid
                    onClick={() => {
                      setFaults([...faults, "H"]);
                    }}
                    item
                    xs={6}
                  >
                    <Button
                      sx={{
                        bgcolor: "gray",
                        color: "white",
                        minHeight: "100px",
                        fontSize: 30,
                      }}
                      fullWidth
                      variant="contained"
                    >
                      H
                    </Button>
                  </Grid>
                  <Grid
                    onClick={() => {
                      setNFCRun(!nfcRun);
                    }}
                    item
                    xs={6}
                  >
                    <Button
                      sx={{
                        bgcolor: "blue",
                        minHeight: "100px",
                        fontSize: 24,
                      }}
                      fullWidth
                      variant="contained"
                    >
                      {nfcRun ? "Undo NFC" : "NFC"}
                    </Button>
                  </Grid>
                  <Grid
                    onClick={() => {
                      setEliminated(!eliminated);
                    }}
                    item
                    xs={12}
                  >
                    <Button
                      sx={{
                        bgcolor: "red",
                        minHeight: "100px",
                        fontSize: 30,
                      }}
                      fullWidth
                      variant="contained"
                    >
                      {eliminated ? "Undo E" : "E"}
                    </Button>
                  </Grid>
                  <Grid
                    onClick={() => {
                      const f = [...faults];
                      f.pop();
                      setFaults(f);
                    }}
                    item
                    xs={12}
                  >
                    <Button fullWidth variant="contained">
                      Undo Last Fault
                    </Button>
                  </Grid>
                </>
              )}
              <Grid item xs={12}>
                <Button
                  disabled={
                    !nfcRun && !eliminated && (time === "" || time === "0")
                  }
                  fullWidth
                  color="success"
                  variant="contained"
                  onClick={() => setSubmitResultOpen(true)}
                >
                  Submit
                </Button>
              </Grid>
              <Modal
                open={submitResultOpen}
                onClose={() => setSubmitResultOpen(false)}
              >
                <Box sx={modalStyle}>
                  <Typography
                    id="modal-modal-title"
                    variant="h6"
                    component="h2"
                  >
                    Submit This Result
                  </Typography>
                  <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                    Are you sure you want to submit this result
                  </Typography>

                  <Button
                    onClick={() => {
                      setSubmitResultOpen(false);
                    }}
                    style={{ minWidth: "100%", marginTop: "30px" }}
                    variant="contained"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      submitResult(nextEntry.id);
                    }}
                    style={{ minWidth: "100%", marginTop: "30px" }}
                    variant="contained"
                  >
                    Confirm
                  </Button>
                </Box>
              </Modal>
            </>
          ) : (
            <>
              <Grid item xs={12}>
                <Typography variant="h6">
                  There are currently no entries queued to run.
                </Typography>
                <Button
                  color="success"
                  onClick={() => {
                    getNextEntry();
                  }}
                  style={{ minWidth: "100%", marginTop: "30px" }}
                  variant="contained"
                >
                  Refresh
                </Button>
              </Grid>
            </>
          )}
        </Grid>
      ) : queue ? (
        <>
          {classValue === 0 ? (
            <Box padding={2} textAlign={"center"}>
              <Typography marginTop={5} marginBottom={5}>
                Please select a class to view the queue
              </Typography>
              <FormControl fullWidth>
                <InputLabel id={`class-select-label`}>
                  Select A Class
                </InputLabel>
                <Select
                  labelId={`class-select-label`}
                  id={`class-select`}
                  label="Select A Class"
                  name="select_class"
                  value={classValue}
                  onChange={(e) => {
                    setClassValue(e.target.value as any);
                    const heightGrades = show.classes.find(
                      (c) => c.id === e.target.value
                    )?.height_grades;

                    const heights = Object.keys(heightGrades);
                    setHeights(heights);
                    setHeight(heights[0]);
                  }}
                  fullWidth
                >
                  {show?.classes?.map((c: C, index: number) => (
                    <MenuItem key={index} value={c.id}>
                      {c.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          ) : (
            <Grid padding={2} container rowSpacing={3}>
              <Grid item xs={12}>
                <Button
                  onClick={() => {
                    getNextEntry();
                    setQueue(false);
                    setScrime(true);
                  }}
                  fullWidth
                  color="secondary"
                  variant="contained"
                >
                  Go To Scrime
                </Button>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6">
                  Queue -{" "}
                  {show?.classes?.find((c) => c.id === classValue)?.name}
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Button
                  variant="contained"
                  onClick={() => {
                    setClassDetailsOpen(true);
                  }}
                  sx={{ marginTop: 2, textTransform: "none" }}
                >
                  Open Course Details
                </Button>
                <Button
                  variant="contained"
                  color="warning"
                  onClick={() => {
                    setCloseClassOpen(true);
                  }}
                  sx={{ textTransform: "none", marginLeft: 3, marginTop: 2 }}
                >
                  Close This Class
                </Button>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => {
                    setSendMessageOpen(true);
                  }}
                  sx={{ textTransform: "none", marginLeft: 3, marginTop: 2 }}
                >
                  PA Announcement
                </Button>
                {/* <Button
                  variant="contained"
                  onClick={() => {
                    generateLeaguePoints();
                  }}
                  sx={{ textTransform: "none", marginLeft: 3, marginTop: 2 }}
                  color="secondary"
                >
                  Generate league points for this class
                </Button> */}
                <Button>
                  <Button
                    variant="contained"
                    onClick={() => {
                      setClassValue(0);
                    }}
                    sx={{ textTransform: "none", marginLeft: 3, marginTop: 2 }}
                    color="error"
                  >
                    Exit this class
                  </Button>
                </Button>
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel id={`height-select-label`}>
                    Select A Height
                  </InputLabel>
                  <Select
                    labelId={`height-select-label`}
                    id={`height-select`}
                    label="Select A Height"
                    name="select_height"
                    fullWidth
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                  >
                    {heights.map((height, index) => (
                      <MenuItem key={index} value={height}>
                        {height}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <DataGrid
                  sx={{
                    // disable cell selection style
                    ".MuiDataGrid-cell:focus": {
                      outline: "none",
                    },
                  }}
                  {...({
                    columns: columns,
                    rows: entries || [],
                  } as any)}
                  autoHeight
                />
              </Grid>

              <Modal
                open={queueConfirmOpen}
                onClose={() => setQueueConfirmOpen(false)}
              >
                <Box sx={modalStyle}>
                  <Typography
                    id="modal-modal-title"
                    variant="h6"
                    component="h2"
                  >
                    {queuedEntry.queued_at ? "Unqueue" : "Queue"} This Entry
                  </Typography>
                  {queuedEntry.time ||
                    queuedEntry.eliminated ||
                    (queuedEntry.nfc_run && (
                      <Typography marginTop={1} color="red">
                        WARNING: THIS PERSON HAS ALREADY RUN IN THIS CLASS.
                        PLEASE MAKE SURE YOU ARE CERTAIN THAT YOU WANT TO
                        COMPLETE THIS ACTION.
                      </Typography>
                    ))}
                  <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                    Are you sure you want to
                    {queuedEntry.queued_at ? " unqueue" : " queue"}{" "}
                    {queuedEntry.partnership}
                  </Typography>

                  <Button
                    onClick={() => {
                      setQueuedEntry({} as Entry);
                      setQueueConfirmOpen(false);
                    }}
                    style={{ minWidth: "100%", marginTop: "30px" }}
                    variant="contained"
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
                    style={{ minWidth: "100%", marginTop: "30px" }}
                    variant="contained"
                  >
                    Confirm
                  </Button>
                </Box>
              </Modal>
              <Modal
                open={closeClassOpen}
                onClose={() => setCloseClassOpen(false)}
              >
                <Box sx={modalStyle}>
                  <Typography
                    id="modal-modal-title"
                    variant="h6"
                    component="h2"
                  >
                    Close This Class
                  </Typography>
                  <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                    Are you sure you want to close this class?
                  </Typography>

                  <Button
                    onClick={() => {
                      setCloseClassOpen(false);
                    }}
                    style={{ minWidth: "100%", marginTop: "30px" }}
                    variant="contained"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      closeClass();
                      setCloseClassOpen(false);
                    }}
                    style={{ minWidth: "100%", marginTop: "30px" }}
                    variant="contained"
                  >
                    Confirm
                  </Button>
                </Box>
              </Modal>
              <Modal
                open={sendMessageOpen}
                onClose={() => setSendMessageOpen(false)}
              >
                <Box sx={modalStyle}>
                  <Typography
                    id="modal-modal-title"
                    variant="h6"
                    component="h2"
                  >
                    Send PA Message
                  </Typography>
                  <TextField
                    sx={{ marginTop: 2 }}
                    fullWidth
                    name="message"
                    label="Message"
                    variant="outlined"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />

                  <Button
                    onClick={() => {
                      setMessage("Calling to 20");
                    }}
                    sx={{ marginTop: 2 }}
                  >
                    Calling to 20
                  </Button>
                  <br />
                  <Button
                    onClick={() => {
                      setMessage("Calling to 40");
                    }}
                  >
                    Calling to 40
                  </Button>
                  <Button
                    onClick={() => {
                      setMessage("Calling all remaining dogs");
                    }}
                  >
                    Calling all remaining dogs
                  </Button>
                  <Button
                    onClick={() => {
                      setMessage("Closing in 5 minutes");
                    }}
                  >
                    Closing in 5 minutes
                  </Button>
                  <Button
                    onClick={() => {
                      setMessage("Walking now, starting in 5 minutes");
                    }}
                  >
                    Walking now, starting in 5 minutes
                  </Button>
                  <Button
                    onClick={() => {
                      setMessage("Walking now, starting in 10 minutes");
                    }}
                  >
                    Walking now, starting in 10 minutes
                  </Button>
                  <Button
                    onClick={() => {
                      setMessage("Walking now, starting in 15 minutes");
                    }}
                  >
                    Walking now, starting in 15 minutes
                  </Button>

                  <Button
                    onClick={() => {
                      setSendMessageOpen(false);
                    }}
                    style={{ minWidth: "100%", marginTop: "30px" }}
                    variant="contained"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      setClassMessage();
                      setMessage("");
                      setSendMessageOpen(false);
                    }}
                    style={{ minWidth: "100%", marginTop: "30px" }}
                    variant="contained"
                  >
                    Confirm
                  </Button>
                </Box>
              </Modal>
              <Modal
                open={classDetailsOpen}
                onClose={() => setClassDetailsOpen(false)}
              >
                <Box sx={modalStyle}>
                  <Typography
                    id="modal-modal-title"
                    variant="h6"
                    component="h2"
                  >
                    Add Course Time and Distance For This Class
                  </Typography>
                  <TextField
                    sx={{ marginTop: 2 }}
                    fullWidth
                    name="course_time"
                    label="Course Time (in seconds)"
                    variant="outlined"
                    type="number"
                    value={courseTime}
                    onChange={handleChange}
                  />
                  <TextField
                    sx={{ marginTop: 2 }}
                    fullWidth
                    name="course_distance"
                    label="Course Distance (in metres)"
                    type="number"
                    variant="outlined"
                    value={courseDistance}
                    onChange={handleChange}
                  />
                  <Button
                    onClick={updateClassDetails}
                    style={{ minWidth: "100%", marginTop: "30px" }}
                    variant="contained"
                  >
                    Confirm
                  </Button>
                  <Button
                    onClick={() => {
                      setClassDetailsOpen(false);
                    }}
                    style={{ minWidth: "100%", marginTop: "30px" }}
                    variant="contained"
                    color="success"
                  >
                    Close
                  </Button>
                </Box>
              </Modal>
              <Modal
                open={changeHandlerName}
                onClose={() => setChangeHandlerName(false)}
              >
                <Box sx={modalStyle}>
                  <Typography
                    id="modal-modal-title"
                    variant="h6"
                    component="h2"
                  >
                    Change Handler Name
                  </Typography>
                  <TextField
                    sx={{ marginTop: 2 }}
                    fullWidth
                    name="handler_name"
                    label="New Handler Name"
                    variant="outlined"
                    value={newHandlerName}
                    onChange={(e) => {
                      setNewHandlerName(e.target.value);
                    }}
                  />
                  <Button
                    onClick={() => {
                      changeHandlerNameReq();
                      setChangeHandlerName(false);
                      setNewHandlerName("");
                      getEntries();
                    }}
                    style={{ minWidth: "100%", marginTop: "30px" }}
                    variant="contained"
                  >
                    Confirm
                  </Button>
                  <Button
                    onClick={() => {
                      setChangeHandlerName(false);
                    }}
                    style={{ minWidth: "100%", marginTop: "30px" }}
                    variant="contained"
                    color="success"
                  >
                    Cancel
                  </Button>
                </Box>
              </Modal>
            </Grid>
          )}
        </>
      ) : (
        <Grid padding={2} container rowSpacing={3}>
          <Grid item xs={12}>
            <Button
              onClick={() => setScrime(true)}
              fullWidth
              color="success"
              variant="contained"
            >
              Scrime
            </Button>
          </Grid>

          <Grid item xs={12}>
            <Button
              onClick={() => setQueue(true)}
              fullWidth
              color="success"
              variant="contained"
            >
              Queue
            </Button>
          </Grid>
        </Grid>
      )}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => {
          setSnackbarOpen(false);
        }}
      >
        <Alert
          onClose={() => {
            setSnackbarOpen(false);
          }}
          severity="success"
          sx={{ width: "100%" }}
        >
          League have been generated for this class
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default App;
