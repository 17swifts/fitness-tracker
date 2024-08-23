import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Typography, Box, Button, List, ListItem, ListItemText, Divider, Grid, Link, Modal, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { firestore } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import Equipment from './Equipment';
import ScheduleWorkout from './ScheduleWorkout';

const WorkoutPlanDetail = () => {
  const { id } = useParams();
  const [workoutPlan, setWorkoutPlan] = useState(null);
  const [isScheduling, setIsScheduling] = useState(false);
  const [exercises, setExercises] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const handleScheduleClick = () => {
    setIsScheduling(true);
  };

  const handleLogWorkoutClick = () => {
    navigate(`/log-workout/${workoutPlan.id}`);
  };

  useEffect(() => {
    const fetchWorkoutPlan = async () => {
      try {
        const docRef = doc(firestore, 'workoutPlans', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const planData = { id: docSnap.id, ...docSnap.data() };
          setWorkoutPlan(planData);
          fetchExerciseDetails(planData);
        } else {
          console.log('No such document!');
        }
      } catch (error) {
        console.error('Error fetching workout plan:', error);
      }
    };

    const fetchExerciseDetails = async (planData) => {
      try {
        const exerciseIds = new Set();
        planData.setGroups.forEach(group => {
          group.sets.forEach(set => {
            exerciseIds.add(set.exerciseId);
          });
        });

        const exercisePromises = Array.from(exerciseIds).map(async (exerciseId) => {
          const exerciseDoc = await getDoc(doc(firestore, 'exercises', exerciseId));
          return { id: exerciseId, data: exerciseDoc.data() };
        });

        const exerciseResults = await Promise.all(exercisePromises);
        const exerciseData = exerciseResults.reduce((acc, { id, data }) => {
          acc[id] = data;
          return acc;
        }, {});
        setExercises(exerciseData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching exercises:', error);
      }
    };

    fetchWorkoutPlan();
  }, [id]);

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  const calculateEstimatedDuration = () => {
    // Assume an average duration for each set, e.g., 1 minute
    const avgSetDuration = 2; // in minutes
    const totalSets = workoutPlan.setGroups.reduce((total, group) => total + group.sets.length, 0);
    return totalSets * avgSetDuration;
  };

  return (
    <Box p={3}>
      <IconButton 
        onClick={() => navigate(-1)} 
      >
        <ArrowBackIcon />
      </IconButton>
      <Typography variant="h4" gutterBottom>
        {workoutPlan.name}
      </Typography>
      <Typography variant="h6" gutterBottom>
        Estimated Duration: {calculateEstimatedDuration()} minutes
      </Typography>

      <Equipment exercises={exercises} workoutPlan={workoutPlan} />

      {workoutPlan.instructions && (
        <Box mb={2}>
          <Typography variant="h6">Instructions:</Typography>
          <Typography dangerouslySetInnerHTML={{ __html: workoutPlan.instructions }}></Typography>
        </Box>
      )}

      <List>
      {workoutPlan.setGroups.map((group, index) => (
          <React.Fragment key={index}>
            {group.isSuperSet && (
              <ListItem>
                <ListItemText
                  primary={`Super Set of ${group.number} sets`}
                  secondary={group.sets.map((set, setIndex) => (
                    <Box key={setIndex} mb={2}>
                        <Grid container spacing={1}>
                            <Grid item xs={1}>
                                {exercises[set.exerciseId] && (
                                    <Link href={`/exercise/${set.exerciseId}`}>
                                      <img 
                                        src={`../${exercises[set.exerciseId].imageUrl}`}
                                        alt={exercises[set.exerciseId].name} 
                                        style={{ width: '80%' }} 
                                      />
                                    </Link>
                                )}
                            </Grid>
                            <Grid item xs={10}>
                                <>
                                <Typography>{exercises[set.exerciseId].name}</Typography>
                                <Typography>{set.reps}{set.notes ? ` - ${set.notes}` : ''}</Typography>
                                </>
                            </Grid>
                        </Grid>
                    </Box>
                  ))}
                />
              </ListItem>
            )}
            {!group.isSuperSet && (
              <ListItem>
                <ListItemText
                  primary={''}
                  secondary={group.sets.map((set, setIndex) => (
                    <Box key={setIndex} mb={2}>
                        <Grid container spacing={1}>
                            <Grid item xs={1}>
                                {exercises[set.exerciseId] && (
                                  <Link href={`/exercise/${set.exerciseId}`}>
                                    <img 
                                      src={`../${exercises[set.exerciseId].imageUrl}`}
                                      alt={exercises[set.exerciseId].name} 
                                      style={{ width: '80%' }} 
                                    />
                                  </Link>
                                )}
                            </Grid>
                            <Grid item xs={10}>
                                <>
                                <Typography>{exercises[set.exerciseId].name}</Typography>
                                <Typography>{set.number} sets x {set.reps}{set.notes ? ` - ${set.notes}` : ''}</Typography>
                                <Typography>90s rest between sets</Typography>
                                </>
                            </Grid>
                        </Grid>
                    </Box>
                  ))}
                />
              </ListItem>
            )}
            <Divider />
          </React.Fragment>
        ))}
      </List>
      <Button variant="outlined" color="secondary" onClick={handleLogWorkoutClick}>
        Start Now
      </Button>
      <Button variant="contained" color="primary" onClick={handleScheduleClick}>
        Schedule Workout
      </Button>

      <Modal open={isScheduling} onClose={() => setIsScheduling(false)}>
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '30%', height: '30%', bgcolor: 'background.paper', boxShadow: 24, overflowY: 'auto', p: 4 }}>
          <ScheduleWorkout workoutId={workoutPlan.id} onClose={() => setIsScheduling(false)} />
        </Box>
      </Modal>

    </Box>
  );
};

export default WorkoutPlanDetail;
