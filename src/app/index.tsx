import { useVideoPlayer, VideoView, type VideoPlayerStatus } from 'expo-video';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, Text, TVFocusGuideView, View } from 'react-native';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const videoSource = require('@/assets/bach-handel-corelli.mp4');

const ControlButton = React.forwardRef<
  View,
  {
    label: string;
    onPress: () => void;
    hasTVPreferredFocus?: boolean;
  }
>(({ label, onPress, hasTVPreferredFocus }, ref) => {
  return (
    <Pressable
      ref={ref}
      onPress={onPress}
      hasTVPreferredFocus={hasTVPreferredFocus}
      className="bg-white/20 focus:bg-blue-600 active:bg-blue-800 rounded-xl px-6 py-4 mx-2"
    >
      <Text className="text-white text-xl font-semibold text-center">
        {label}
      </Text>
    </Pressable>
  );
});

function ProgressBar({ fraction }: { fraction: number }) {
  const pct = Math.min(Math.max(fraction, 0), 1) * 100;
  return (
    <View className="w-4/5 h-2 bg-white/20 rounded-full overflow-hidden">
      <View
        className="h-full bg-blue-600 rounded-full"
        style={{ width: `${pct}%` }}
      />
    </View>
  );
}

export default function VideoPlayerScreen() {
  const videoViewRef = useRef<VideoView>(null);
  const playButtonRef = useRef<View>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoStatus, setVideoStatus] = useState<VideoPlayerStatus>('idle');
  const [progress, setProgress] = useState(0);

  const player = useVideoPlayer(videoSource, (p) => {
    p.loop = true;
    p.addListener('statusChange', (event) => {
      setVideoStatus(event.status);
    });
  });

  useEffect(() => {
    const subscription = player.addListener('playingChange', (event) => {
      setIsPlaying(event.isPlaying);
    });
    return () => subscription.remove();
  }, [player]);

  useEffect(() => {
    const id = setInterval(() => {
      if (player.duration > 0) {
        setProgress(player.currentTime / player.duration);
      }
    }, 1000);
    return () => clearInterval(id);
  }, [player]);

  const togglePlayPause = useCallback(() => {
    if (player.playing) {
      player.pause();
    } else {
      player.play();
    }
  }, [player]);

  const skipBackward = useCallback(() => {
    player.currentTime = Math.max(0, player.currentTime - 10);
  }, [player]);

  const skipForward = useCallback(() => {
    player.currentTime = Math.min(player.duration, player.currentTime + 10);
  }, [player]);

  const rewind = useCallback(() => {
    player.currentTime = 0;
  }, [player]);

  const enterFullScreen = useCallback(() => {
    videoViewRef.current?.enterFullscreen();
  }, []);

  return (
    <TVFocusGuideView autoFocus style={{ flex: 1 }}>
      <View className="flex-1 bg-black items-center justify-center">
        <View className="w-4/5 aspect-video">
          {videoStatus === 'readyToPlay' ? (
            <VideoView
              focusable={false}
              ref={videoViewRef}
              player={player}
              style={{ width: '100%', height: '100%' }}
              nativeControls={true}
              contentFit="contain"
            />
          ) : null}
        </View>

        <ProgressBar fraction={progress} />

        <View className="flex-row items-center justify-center mt-4">
          <ControlButton label="Rewind" onPress={rewind} />
          <ControlButton label="-10s" onPress={skipBackward} />
          <ControlButton
            ref={playButtonRef}
            label={isPlaying ? 'Pause' : 'Play'}
            onPress={togglePlayPause}
            hasTVPreferredFocus
          />
          <ControlButton label="+10s" onPress={skipForward} />
          <ControlButton label="Fullscreen" onPress={enterFullScreen} />
        </View>
      </View>
    </TVFocusGuideView>
  );
}
