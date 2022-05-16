#!/bin/bash
#SBATCH --job-name=mutant_1
#SBATCH --account=stf
#### SBATCH --account=pfaendtner
#SBATCH --partition=hugemem
#### SBATCH --partition=pfaendtner
#SBATCH --nodes=2
#### SBATCH --ntasks-per-node=40
#SBATCH --ntasks= 1
#SBATCH --time=24:00:00
#SBATCH --mem= 240gb

## SBATCH --workdir=$SLURM_SUBMIT_DIR

echo "SLURM_JOBID="$SLURM_JOBID
echo "SLURM_JOB_NODELIST"=$SLURM_JOB_NODELIST
echo "SLURM_NNODES"=$SLURM_NNODES
echo "SLURMTMPDIR="$SLURMTMPDIR
echo "working directory = "$SLURM_SUBMIT_DIR


source ~/.bash_profile
conda activate coolname

python

exit 0
