import React, { useEffect, useState } from "react";
import "./App.css";
import {
  Box,
  Button,
  CssBaseline,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Modal,
  Select,
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
};

const showID = 5;

function App() {
  const [faults, setFaults] = useState<string[]>([]);
  const [eliminated, setEliminated] = useState<boolean>(false);
  const [nfcRun, setNFCRun] = useState<boolean>(false);
  const [time, setTime] = useState<string>("0");
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
  }, []);

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
    const response = await axios.post(
      "https://api.easyagility.co.uk/update-class-details",
      {
        class_id: classValue,
        height: height,
        course_time: courseTime,
        course_distance: courseDistance,
      }
    );

    await getShow();

    setClassDetailsOpen(false);
  };

  const getShow = async () => {
    const response = await axios.get(
      `https://api.easyagility.co.uk/shows/${showID}`
    );

    setShow(response.data);
    if (classValue === 0) {
      setClassValue(response.data?.classes[0].id);
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

  const getNextEntry = async () => {
    const response = await axios.get(
      `https://api.easyagility.co.uk/shows/${showID}/entries/next`
    );

    setNextEntry(response.data);
  };

  const getEntries = async () => {
    const response = await axios.get(
      `https://api.easyagility.co.uk/shows/${showID}/classes/${classValue}/entries?height=${encodeURIComponent(
        height
      )}`
    );

    setEntries(response.data);
  };

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

    setTime("0");
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
      width: 120,
      getActions: (params: any) => {
        return [
          <Button
            fullWidth
            variant="outlined"
            color={params.row.queued_at ? "primary" : "success"}
            onClick={() => {
              setQueuedEntry(params.row);
              setQueueConfirmOpen(true);
            }}
          >
            {params.row.queued_at ? "Unqueue" : "Queue"}
          </Button>,
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
  ];

  return (
    <Box sx={{ display: "flex", textAlign: "center" }}>
      <CssBaseline />

      {scrime ? (
        <Grid padding={2} container rowSpacing={3}>
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
                  <Typography variant="h6">Eliminated</Typography>
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
                  <Grid item xs={12}>
                    <Typography variant="h6">
                      Faults: {faults.length === 0 ? "None" : faults.join(", ")}
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
                    <Button
                      onClick={() => {
                        setFaults([...faults, "R"]);
                      }}
                      fullWidth
                      variant="contained"
                    >
                      Refusal
                    </Button>
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      onClick={() => {
                        setFaults([...faults, "5"]);
                      }}
                      fullWidth
                      variant="contained"
                    >
                      5
                    </Button>
                  </Grid>
                  <Grid
                    onClick={() => {
                      setEliminated(!eliminated);
                    }}
                    item
                    xs={12}
                  >
                    <Button fullWidth variant="contained">
                      {eliminated ? "Undo Elimination" : "Elimination"}
                    </Button>
                  </Grid>
                  <Grid
                    onClick={() => {
                      setNFCRun(!nfcRun);
                    }}
                    item
                    xs={12}
                  >
                    <Button fullWidth variant="contained">
                      {nfcRun ? "Undo NFC" : "NFC"}
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
                  disabled={!nfcRun && !eliminated && parseFloat(time) === 0}
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
              <Typography variant="h6">Queue</Typography>
            </Grid>

            <Grid item xs={6}>
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
            </Grid>
            <Grid item xs={6}>
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
                <Typography id="modal-modal-title" variant="h6" component="h2">
                  {queuedEntry.queued_at ? "Unqueue" : "Queue"} This Entry
                </Typography>
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
              open={classDetailsOpen}
              onClose={() => setClassDetailsOpen(false)}
            >
              <Box sx={modalStyle}>
                <Typography id="modal-modal-title" variant="h6" component="h2">
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
              </Box>
            </Modal>
          </Grid>
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
    </Box>
  );
}

export default App;
