import React, { useState, useEffect } from 'react';
import { firestore } from '../firebase';
import { collection, query, getDocs, addDoc } from 'firebase/firestore';
import { useAuth } from '../hooks/useAuth';  // Custom hook to get current user
import { TextField, Select, MenuItem, Button, Typography, Grid, IconButton, Box } from '@mui/material';
import { Add } from '@mui/icons-material';
import './styles/ExerciseLibrary.css';

const ExerciseLibrary = ({ onSelectExercise, onClose }) => {
  const [exercises, setExercises] = useState([]);
  const [isAddingExercise, setIsAddingExercise] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const [filter2, setFilter2] = useState('');
  const [newExercise, setNewExercise] = useState({ name: '', muscleGroup: '', imageUrl: '', videoUrl: '' });
  const [selectedExercise, setSelectedExercise] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchExercises();
  }, []);

  const fetchExercises = async () => {
    const q = query(collection(firestore, 'exercises'));
    const querySnapshot = await getDocs(q);
    const exercisesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setExercises(exercisesData);
  };

  const handleAddExercise = async () => {
    try {
      await addDoc(collection(firestore, 'exercises'), {
        ...newExercise,
        userId: user.uid
      });
      setNewExercise({ name: '', muscleGroup: '', imageUrl: '', videoUrl: '' });
      fetchExercises();  // Refetch exercises after adding a new one
    } catch (error) {
      console.error('Error adding exercise:', error);
    }
  };

  const filteredExercises = exercises.filter(exercise =>
    exercise.name.toLowerCase().includes(search.toLowerCase()) &&
    (!filter || exercise.muscleGroup === filter) && 
    (!filter2 || exercise.category === filter2)
  );

  return (
    <Box sx={{ position: 'relative', width: '100%', height: '100%', overflowY: 'auto', p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Exercise Library
        <IconButton color="primary" onClick={() => setIsAddingExercise(!isAddingExercise)}>
          <Add />
        </IconButton>
      </Typography>

      <TextField value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search Exercises" fullWidth />
      <Select value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Muscle Group" displayEmpty fullWidth>
        <MenuItem value="">All</MenuItem>
        <MenuItem value="Back">Back</MenuItem>
        <MenuItem value="Shoulders">Shoulders</MenuItem>
        <MenuItem value="Core">Core</MenuItem>
        <MenuItem value="Chest">Chest</MenuItem>
        <MenuItem value="Biceps">Biceps</MenuItem>
        <MenuItem value="Triceps">Triceps</MenuItem>
        <MenuItem value="Glutes">Glutes</MenuItem>
        <MenuItem value="Calves">Calves</MenuItem>
        <MenuItem value="Hamstrings">Hamstrings</MenuItem>
        <MenuItem value="Quads">Quads</MenuItem>
        <MenuItem value="Full Body">Full Body</MenuItem>
        <MenuItem value="Cardio">Cardio</MenuItem>
        <MenuItem value="Forearm">Forearm</MenuItem>
      </Select>
      <Select value={filter2} onChange={(e) => setFilter2(e.target.value)} placeholder="Category" displayEmpty fullWidth>
        <MenuItem value="">All</MenuItem>
        <MenuItem value="Push">Push</MenuItem>
        <MenuItem value="Pull">Pull</MenuItem>
        <MenuItem value="Squat">Squat</MenuItem>
        <MenuItem value="Lunge">Lunge</MenuItem>
        <MenuItem value="Hinge">Hinge</MenuItem>
        <MenuItem value="Gait">Gait</MenuItem>
        <MenuItem value="Twist">Twist</MenuItem>
      </Select>
      <Grid container spacing={3} style={{ marginTop: 20 }}>
        {filteredExercises.map((exercise, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Box onClick={() => setSelectedExercise(exercise)} sx={{ border: selectedExercise?.id === exercise.id ? '2px solid blue' : 'none', padding: '8px', cursor: 'pointer' }}>
              <Typography variant="h6">{exercise.name}</Typography>
              <img src={`../${exercise.imageUrl}`} alt={exercise.name} style={{ width: '60%' }} />
              <Typography variant="body2">{exercise.muscleGroup}</Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
      {isAddingExercise && (
        <form onSubmit={handleAddExercise}>
          <TextField label="Name" value={newExercise.name} onChange={(e) => setNewExercise({ ...newExercise, name: e.target.value })} fullWidth style={{ marginBottom: 20 }} />
          <TextField label="Muscle Group" value={newExercise.muscleGroup} onChange={(e) => setNewExercise({ ...newExercise, muscleGroup: e.target.value })} fullWidth style={{ marginBottom: 20 }} />
          <TextField label="Image URL" value={newExercise.imageUrl} onChange={(e) => setNewExercise({ ...newExercise, imageUrl: e.target.value })} fullWidth style={{ marginBottom: 20 }} />
          <TextField label="Video URL" value={newExercise.videoUrl} onChange={(e) => setNewExercise({ ...newExercise, videoUrl: e.target.value })} fullWidth style={{ marginBottom: 20 }} />
          <Button variant="contained" color="primary" type="submit">
            Add Exercise
          </Button>
          <Button variant="contained" color="primary" onClick={() => setIsAddingExercise(!isAddingExercise)}>
            Cancel
          </Button>
        </form>
      )}
      <Button variant="contained" color="primary" onClick={onClose} style={{ marginTop: 20 }}>
        Back
      </Button>
      {selectedExercise && (
        <Button variant="contained" color="primary" onClick={() => onSelectExercise(selectedExercise)} style={{ marginTop: 20 }}>
          Add
        </Button>
      )}
    </Box>
  );
};

export default ExerciseLibrary;
