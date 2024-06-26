import React, { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  Box,
  Button,
  Container,
  Stack,
  TextField,
  Typography,
  Divider,
} from "@mui/material";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { ChromePicker, ColorResult } from "react-color";
import { ReactComponent as CarSvg } from "../../assets/svgs/car.svg";
import axios from "axios";
import Garage from "../garage/garage";
import { Await } from "react-router-dom";
import { carNames, carColors } from "../garage/data";

interface Car {
  id: number | string;
  name: string;
  color: string;
  distance?: number;
  velocity?: number;
}

const commonStyles = {
  fontSize: "8px",
  width: "15px",
};

const commonStyleButton = {
  fontSize: "8px",
  minWidth: "10px",
  width: "10px !important",
};

const API_SERVER = "http://localhost:3000";
const MAX_DISTANCE: any = "1200px";
const TRACK_WIDTH: any = "20px";

const Home = () => {
  const [initialColor, setInitialColor] = useState("#000000");
  const [showPickerCreate, setShowPickerCreate] = useState(false); // State to toggle the visibility of the color picker
  const [showPickerUpdate, setShowPickerUpdate] = useState(false); // State to toggle the visibility of the color picker

  const [garage, setGarage] = useState<Car[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [carName, setCarName] = useState("");
  const [newCars, setNewCars] = useState<Car[]>([]);
  const [selectedCar, setSelectedCar] = useState<Car>({
    id: "",
    name: "",
    color: "",
  });
  const [carPosition, setCarPosition] = useState(0);

  const TRACK_WIDTH: number = 100;
  console.log(carPosition);

  const startEngine = async (carId: number | string) => {
    try {
      const response = await axios.patch(
        `${API_SERVER}/engine?id=${carId}&status=started`
      );
      console.log(response);
      if (response.status === 200) {
        const { distance, velocity } = response.data;
        const time = distance / velocity;
        const velocityByPercent = TRACK_WIDTH / (time / 100);
        let distancePassed = 0;
        while (distancePassed < TRACK_WIDTH) {
          console.log(distancePassed, velocityByPercent);
          distancePassed += velocityByPercent;
          setCarPosition(distancePassed);
        }
      }
    } catch (e) {
      console.log(e);
    }
  };

  const generateRandomCars = async () => {
    for (let i = 0; i < 100; i++) {
      await axios.post(`${API_SERVER}/garage`, {
        id: uuidv4(),
        name: carNames[Math.floor(Math.random() * (carNames.length - 1))],
        color: carColors[Math.floor(Math.random() * (carColors.length - 1))],
      });
    }

    await fetchGarageData();
  };

  const fetchGarageData = async () => {
    try {
      const response = await axios.get(`${API_SERVER}/garage`);

      if (response.status === 200) {
        setGarage(response.data);
      }
    } catch (e) {
      console.log(e);
    }
  };

  const addDataToGarage = () => {
    const newCar: Car = {
      id: uuidv4(),
      color: initialColor,
      name: carName,
    };
    setNewCars([...newCars, newCar]);
    createGarageData(newCar);
  };

  const updateGarageData = async (updatedCar: Car) => {
    try {
      const response = await axios.put(
        `${API_SERVER}/garage/${selectedCar.id}`,
        updatedCar,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (response.status === 200) {
        await fetchGarageData();
      }
    } catch (e) {
      console.log(e);
    }
  };

  const createGarageData = async (carData: any) => {
    try {
      const response = await axios.post(`${API_SERVER}/garage`, carData, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.status === 201) {
        await fetchGarageData();
      }
    } catch (e) {
      console.log(e);
    }
  };

  const deleteGarageData = async (carId: string | number) => {
    console.log(carId);
    try {
      const response = await axios.delete(`${API_SERVER}/garage/${carId}`);

      if (response.status === 201) {
        await fetchGarageData();
      }
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    fetchGarageData();
  }, []);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  const handleShowCreateClick = () => {
    setShowPickerCreate(!showPickerCreate); // Toggle the visibility of the color picker
  };

  const handleShowUpdateClick = () => {
    setShowPickerUpdate(!showPickerUpdate); // Toggle the visibility of the color picker
  };

  const handleInitialColorChange = (newColor: ColorResult) => {
    setInitialColor(newColor.hex);
  };

  // Calculate pagination indices
  const startIndex = (currentPage - 1) * 7;
  const endIndex = startIndex + 7;
  const currentCars = garage.slice(startIndex, endIndex);

  return (
    <Container>
      <Box
        sx={{
          display: "flex",
          gap: "15px",
          flexDirection: "column",
          width: "150px",
        }}
        mt={5}
      >
        <Button variant="outlined" color="primary">
          Garage
        </Button>
        <Button variant="outlined" color="success">
          Winners
        </Button>
      </Box>

      <Box
        sx={{ display: "flex", gap: "15px", justifyContent: "space-around" }}
        mt={6}
      >
        <Box>
          <Button
            variant="outlined"
            color="primary"
            size="small"
            sx={{ marginRight: "10px" }}
          >
            Race
          </Button>
          <Button variant="outlined" color="secondary" size="small">
            Reset
          </Button>
        </Box>

        <Box sx={{ display: "flex", position: "relative", gap: "15px" }}>
          <TextField
            value={carName}
            onChange={(e) => setCarName(e.target.value)}
            label="TYPE CAR BRAND"
            variant="outlined"
            size="small"
          />
          <Button
            onClick={handleShowCreateClick}
            variant="outlined"
            size="small"
            sx={{ fontSize: "10px", minWidth: "10px" }}
          >
            pick
          </Button>
          {showPickerCreate && (
            <Box
              style={{
                position: "absolute",
                zIndex: 9999,
                top: "0",
                left: "100%",
              }}
            >
              <ChromePicker
                color={initialColor}
                onChange={handleInitialColorChange}
              />
            </Box>
          )}
          <Button
            onClick={() => addDataToGarage()}
            variant="contained"
            size="small"
            color="success"
          >
            Create
          </Button>
        </Box>

        <Box sx={{ display: "flex", position: "relative", gap: "15px" }}>
          <TextField
            value={selectedCar.name}
            onChange={(e) =>
              setSelectedCar({ ...selectedCar, name: e?.target?.value })
            }
            label="UPDATE CAR BRAND"
            variant="outlined"
            size="small"
          />
          <Button
            onClick={handleShowUpdateClick}
            variant="outlined"
            size="small"
            sx={{ fontSize: "10px", minWidth: "10px" }}
          >
            pick
          </Button>
          {showPickerUpdate && (
            <Box
              style={{
                position: "absolute",
                zIndex: 9999,
                top: "0",
                left: "100%",
              }}
            >
              <ChromePicker
                color={selectedCar.color}
                onChange={(e) =>
                  setSelectedCar({ ...selectedCar, color: e?.hex })
                }
              />
            </Box>
          )}
          <Button
            onClick={() => updateGarageData(selectedCar)}
            variant="contained"
            size="small"
            color="success"
          >
            Update
          </Button>
        </Box>

        <Button variant="outlined" onClick={generateRandomCars}>
          Generate Cars
        </Button>
      </Box>

      {/* DIVIDER BOX */}
      <Box
        sx={{ width: "100%", height: "30px", border: "2px dashed black" }}
        mt={5}
      />
      {/* DIVIDER BOX */}

      {/* CAR RACE CONTAINER */}
      <Box sx={{ display: "flex", position: "relative", width: "100%" }} my={2}>
        <Box sx={{ position: "relative" }}>
          {currentCars.map((car) => (
            <Box
              key={car.id}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "15px",
                margin: "20px",
              }}
            >
              <Stack direction="column" spacing={1}>
                <Button
                  sx={{ ...commonStyles }}
                  color="success"
                  variant="outlined"
                  onClick={() => setSelectedCar(car)}
                >
                  Select
                </Button>
                <Button
                  onClick={() => deleteGarageData(car.id)}
                  sx={{ ...commonStyles }}
                  color="error"
                  variant="outlined"
                >
                  Remove
                </Button>
              </Stack>
              <Stack direction="column" spacing={1}>
                <Button
                  onClick={() => startEngine(car.id)}
                  sx={{ ...commonStyleButton }}
                  variant="outlined"
                  color="success"
                >
                  A
                </Button>
                <Button
                  sx={{ ...commonStyleButton }}
                  variant="outlined"
                  color="error"
                >
                  B
                </Button>
              </Stack>
              {/* Render cars on the race track */}
              <Box
                sx={{
                  position: "relative",
                  width: "50px",
                  height: "50px",
                }}
              >
                <CarSvg
                  style={{
                    position: "absolute",
                    left: `${carPosition * 0.7}vw`,
                    transition: "left 1s linear",
                    width: "50px",
                    height: "50px",
                  }}
                  fill={car.color}
                  stroke={car.color}
                />
              </Box>
            </Box>
          ))}
        </Box>

        {/* START BOX */}
        <Box
          sx={{
            transform: "rotate(180deg)",
            width: "30px",
            position: "relative",
            border: "2px dashed gray",
            margin: "0 20px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <Typography
            sx={{
              textTransform: "uppercase",
              letterSpacing: "5px",
              transform: "rotate(270deg)",
            }}
          >
            Start
          </Typography>
        </Box>
        {/* START BOX */}
        <TableContainer>
          <Table sx={{ minWidth: 550 }} aria-label="simple table">
            <TableBody>
              {currentCars.map((car) => (
                <TableRow key={car.id}>
                  <TableCell
                    sx={{
                      padding: "35px",
                      border: "1px dashed rgba(224, 224, 224, 1)",
                      borderLeft: "0px",
                    }}
                  >
                    <Typography
                      sx={{ textTransform: "uppercase", opacity: "0.5" }}
                    >
                      {car.name}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        {/* END BOX */}
        <Box
          sx={{
            transform: "rotate(180deg)",
            width: "30px",
            marginRight: "5px",
            border: "2px dashed gray",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <Typography
            sx={{
              textTransform: "uppercase",
              letterSpacing: "5px",
              transform: "rotate(270deg)",
            }}
          >
            Finish
          </Typography>
        </Box>
        <Box
          sx={{
            border: "1px dashed rgba(224, 224, 224, 1)",
            width: "50px",
            borderLeft: "0px",
            borderRight: "0px",
          }}
        >
          <Box
            sx={{
              borderBottom: "1px dashed rgba(224, 224, 224, 1)",
              height: "98px",
            }}
          />
          <Box
            sx={{
              borderBottom: "1px dashed rgba(224, 224, 224, 1)",
              height: "98px",
            }}
          />
          <Box
            sx={{
              borderBottom: "1px dashed rgba(224, 224, 224, 1)",
              height: "98px",
            }}
          />
          <Box
            sx={{
              borderBottom: "1px dashed rgba(224, 224, 224, 1)",
              height: "98px",
            }}
          />
        </Box>
        {/* END BOX */}
      </Box>
      {/* CAR RACE CONTAINER */}

      {/* DIVIDER BOX */}
      <Box sx={{ width: "100%", height: "30px", border: "2px dashed black" }} />
      {/* DIVIDER BOX */}

      {/* Pagination */}
      {garage.length > 0 && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            marginTop: 2,
            marginBottom: 5,
          }}
        >
          {[...Array(Math.ceil(garage.length / 7))].map((_, index) => (
            <Button
              key={index}
              onClick={() => handlePageChange(index + 1)}
              sx={{ marginX: 1, width: "30px" }} // Adjust width as needed
              variant={currentPage === index + 1 ? "contained" : "outlined"}
              color="primary"
            >
              {index + 1}
            </Button>
          ))}
        </Box>
      )}
    </Container>
  );
};

export default Home;
