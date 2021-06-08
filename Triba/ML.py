from PIL import Image
import matplotlib.pyplot as plt
import matplotlib
import glob
import torch
import torch.nn as nn
import torch.nn.functional as F
import torch.optim as optim
import librosa
import os
import random
import time
import copy
import numpy as np
import warnings
warnings.filterwarnings('ignore')


def predict_class(files):

    class M5(nn.Module):
        def __init__(self, n_input=1, n_output=35, stride=16, n_channel=32):
            super().__init__()
            self.conv1 = nn.Conv1d(n_input, n_channel, kernel_size=80, stride=stride)
            self.bn1 = nn.BatchNorm1d(n_channel)
            self.pool1 = nn.MaxPool1d(4)
            self.conv2 = nn.Conv1d(n_channel, n_channel, kernel_size=3)
            self.bn2 = nn.BatchNorm1d(n_channel)
            self.pool2 = nn.MaxPool1d(4)
            self.conv3 = nn.Conv1d(n_channel, 2 * n_channel, kernel_size=3)
            self.bn3 = nn.BatchNorm1d(2 * n_channel)
            self.pool3 = nn.MaxPool1d(4)
            self.conv4 = nn.Conv1d(2 * n_channel, 2 * n_channel, kernel_size=3)
            self.bn4 = nn.BatchNorm1d(2 * n_channel)
            self.pool4 = nn.MaxPool1d(4)
            self.fc1 = nn.Linear(2 * n_channel, n_output)

        def forward(self, x):
            x = self.conv1(x)
            x = F.relu(self.bn1(x))
            x = self.pool1(x)
            x = self.conv2(x)
            x = F.relu(self.bn2(x))
            x = self.pool2(x)
            x = self.conv3(x)
            x = F.relu(self.bn3(x))
            x = self.pool3(x)
            x = self.conv4(x)
            x = F.relu(self.bn4(x))
            x = self.pool4(x)
            x = F.avg_pool1d(x, x.shape[-1])
            x = x.permute(0, 2, 1)
            x = self.fc1(x)
            return F.log_softmax(x, dim=2)

    def initialize_model(num_classes):
        """ Using M5 model """
        model = M5(n_input=1, n_output=num_classes)
        return model

    # CNN model initialization
    num_classes = 35
    device = device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model = initialize_model(num_classes)
    model = model.to(device)

    #transform = torchaudio.transforms.Resample(orig_freq=16000, new_freq=8000)
    MODEL_PATH = "./model/m5_multigpu_best_30_epochs.pt"
    model.load_state_dict(torch.load(MODEL_PATH, map_location=device))

    custom_set = []

    for f in files:
        fname = os.path.basename(f)

        from pydub import AudioSegment
        sound = AudioSegment.from_file(f)

        halfway_point = len(sound) // 2
        first_half = sound[:halfway_point]
        second_half = sound[halfway_point:]

        first_half.export("./audio_recordings/{}.wav".format(fname + "_1"), format="wav")
        second_half.export("./audio_recordings/{}.wav".format(fname + "_2"), format="wav")

        audio1 = librosa.load("./audio_recordings/{}.wav".format(fname + "_1"), sr=8000)
        audio2 = librosa.load("./audio_recordings/{}.wav".format(fname + "_2"), sr=8000)
        custom_set.append(torch.tensor(audio1[0].reshape(1, audio1[0].shape[0])))
        custom_set.append(torch.tensor(audio2[0].reshape(1, audio2[0].shape[0])))

    predictions = []
    model.eval()
    with torch.no_grad():
        for inputs in custom_set:
            inputs = inputs.reshape((1, inputs.shape[0], inputs.shape[1]))
            inputs = inputs.to(device)
            
            outputs = model(inputs)
            _, predicted = torch.max(outputs.flatten(), 0)
            predicted = torch.Tensor.cpu(predicted).numpy()
            if(int(predicted) == 30):
                predicted = 3
            predictions.append(int(predicted))
    print("Predictions ML: ", predictions)
    if predictions[0] >= 0 and predictions[0] <= 9 and predictions[1] >= 0 and predictions[1] <= 9:
        return predictions
    else:
        return None