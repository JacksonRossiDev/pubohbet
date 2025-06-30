// components/PostCard.jsx
import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import StepIndicator from "react-native-step-indicator";
import moment from "moment";

const STEP_LABELS = ["Init", "Ack", "Comp", "Paid"];
const stepStyles = {
  stepIndicatorSize: 20,
  currentStepIndicatorSize: 24,
  separatorStrokeWidth: 2,
  currentStepStrokeWidth: 3,
  stepStrokeCurrentColor: "#3498db",
  stepStrokeFinishedColor: "#3498db",
  stepStrokeUnFinishedColor: "#ecf0f1",
  separatorFinishedColor: "#3498db",
  separatorUnFinishedColor: "#ecf0f1",
  stepIndicatorFinishedColor: "#3498db",
  stepIndicatorUnFinishedColor: "#fff",
  stepIndicatorCurrentColor: "#fff",

  // show labels
  stepIndicatorLabelFontSize: 8,
  currentStepIndicatorLabelFontSize: 8,
  labelColor: "#888",
  currentStepLabelColor: "#3498db",
  stepIndicatorLabelCurrentColor: "#3498db",
  stepIndicatorLabelFinishedColor: "#fff",
  stepIndicatorLabelUnFinishedColor: "#888",
};

export default function PostCard({
      post,
      phase,         // ← now coming from Feed
      onLike,
      onComment,
      onPress,
    }) {
      const liked = !!post.currentUserLike;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      {/* Header w/ two avatars */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Image source={{ uri: post.user.ppUrl }} style={styles.avatar} />
          {post.userRisker?.ppUrl && (
            <Image
              source={{ uri: post.userRisker.ppUrl }}
              style={[styles.avatar, styles.avatarOverlay]}
            />
          )}
        </View>
        <View style={styles.headerText}>
          <Text style={styles.title}>
            {post.user.name} challenged {post.userRisker?.name}
          </Text>
          <Text style={styles.time}>
            {moment(post.creation.seconds * 1000).fromNow()}
          </Text>
        </View>
      </View>

      {/* Main image */}
      {post.downloadURL?.length > 0 && (
        <Image source={{ uri: post.downloadURL }} style={styles.image} />
      )}

      {/* Caption */}
      {post.caption?.length > 0 && (
        <Text style={styles.caption}>{post.caption}</Text>
      )}

      {/* Wager Row */}
      <View style={styles.wagerRow}>
        <Ionicons name="cash-outline" size={18} color="#27ae60" />
        <Text style={styles.wagerText}>${post.wager}</Text>
      </View>

      {/* Steps Row */}
      <View style={styles.stepsRow}>
      <StepIndicator
    key={`step-${post.id}`}           
    customStyles={stepStyles}
    currentPosition={phase - 1}      
    labels={STEP_LABELS}
    stepCount={4}
    direction="horizontal"
  />
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity onPress={() => onLike(post.user.uid, post.id)}>
          <Ionicons
            name={liked ? "heart" : "heart-outline"}
            size={22}
            color={liked ? "#e74c3c" : "#555"}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.commentBtn}
          onPress={() => onComment(post)}
        >
          <Ionicons name="chatbubble-outline" size={22} color="#555" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    overflow: "hidden",
    elevation: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
  },
  avatarContainer: {
    width: 40,
    height: 40,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  avatarOverlay: {
    position: "absolute",
    right: -6,
    top: 0,
    borderWidth: 2,
    borderColor: "#fff",
  },
  headerText: {
    marginLeft: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
  },
  time: {
    fontSize: 10,
    color: "#888",
    marginTop: 2,
  },
  image: {
    width: "100%",
    aspectRatio: 1,
    backgroundColor: "#eee",
  },
  caption: {
    padding: 12,
    fontSize: 14,
    color: "#333",
  },
  wagerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  wagerText: {
    marginLeft: 4,
    fontSize: 14,
    color: "#27ae60",
    fontWeight: "500",
  },
  stepsRow: {
    paddingHorizontal: 12,
    paddingBottom: 12, // room for labels
    backgroundColor: "#fff",
  },
  actions: {
    flexDirection: "row",
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  commentBtn: {
    marginLeft: 16,
  },
});
