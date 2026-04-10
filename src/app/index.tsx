import { useVideoPlayer, VideoView } from 'expo-video';
import React, { useCallback, useRef, useState } from 'react';
import { Pressable, Text, TVFocusGuideView, View } from 'react-native';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const videoSource = require('@/assets/bach-handel-corelli.mp4');

function ControlButton({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="bg-white/20 focus:bg-blue-600 active:bg-blue-800 rounded-xl px-6 py-4 mx-2"
    >
      <Text className="text-white text-xl font-semibold text-center">
        {label}
      </Text>
    </Pressable>
  );
}

export default function VideoPlayerScreen() {
  const videoViewRef = useRef<VideoView>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const player = useVideoPlayer(videoSource, (p) => {
    p.loop = true;
    p.play();
  });

  React.useEffect(() => {
    const subscription = player.addListener('playingChange', (event) => {
      setIsPlaying(event.isPlaying);
    });
    return () => subscription.remove();
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
    <View className="flex-1 bg-black items-center justify-center">
      <View className="w-4/5 aspect-video">
        <VideoView
          ref={videoViewRef}
          player={player}
          style={{ width: '100%', height: '100%' }}
          nativeControls={isFullscreen}
          contentFit="contain"
          onFullscreenEnter={() => setIsFullscreen(true)}
          onFullscreenExit={() => setIsFullscreen(false)}
        />
      </View>

      <TVFocusGuideView autoFocus trapFocusUp trapFocusDown>
        <View className="flex-row items-center justify-center mt-8">
          <ControlButton label="Rewind" onPress={rewind} />
          <ControlButton label="-10s" onPress={skipBackward} />
          <ControlButton
            label={isPlaying ? 'Pause' : 'Play'}
            onPress={togglePlayPause}
          />
          <ControlButton label="+10s" onPress={skipForward} />
          <ControlButton label="Fullscreen" onPress={enterFullScreen} />
        </View>
      </TVFocusGuideView>
    </View>
  );
}
