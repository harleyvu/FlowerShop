import React, { useRef, useState } from "react";
import {
  Dimensions,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

type Props = {
  images: string[];              // uri hoặc file local bằng require(...) đã resolve thành uri
  height?: number;               // chiều cao banner
  borderRadius?: number;         // bo góc
  autoplay?: boolean;            // nếu muốn tự chạy
  intervalMs?: number;           // thời gian mỗi slide
};

export default function BannerCarousel({
  images,
  height = 170,
  borderRadius = 16,
  autoplay = false,
  intervalMs = 3000,
}: Props) {
  const [index, setIndex] = useState(0);
  const ref = useRef<ScrollView>(null);

  // optional autoplay
  React.useEffect(() => {
    if (!autoplay || images.length <= 1) return;
    const id = setInterval(() => {
      const next = (index + 1) % images.length;
      ref.current?.scrollTo({ x: next * width, animated: true });
      setIndex(next);
    }, intervalMs);
    return () => clearInterval(id);
  }, [index, autoplay, images.length, intervalMs]);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x;
    const i = Math.round(x / width);
    if (i !== index) setIndex(i);
  };

  return (
    <View style={{ marginHorizontal: 14, marginBottom: 12 }}>
      <ScrollView
        ref={ref}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        style={{ borderRadius, overflow: "hidden" }}
      >
        {images.map((uri, i) => (
          <Image
            key={i}
            source={{ uri }}
            style={{ width: width - 28, height, resizeMode: "cover" }}
          />
        ))}
      </ScrollView>

      {/* dots */}
      <View style={styles.dots}>
        {images.map((_, i) => (
          <View
            key={i}
            style={[styles.dot, i === index && styles.dotActive]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  dots: {
    position: "absolute",
    bottom: 8,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#ffffff88",
  },
  dotActive: {
    backgroundColor: "#fff",
  },
});
