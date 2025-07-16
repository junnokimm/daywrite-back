// utils/lastfm.js
import axios from "axios";
import express from "express";

const LASTFM_API_KEY = process.env.LASTFM_API_KEY;
const BASE_URL = "http://ws.audioscrobbler.com/2.0/";

export const getRecommendedTracks = async (keyword, genre) => {
  try {
    const response = await axios.get( BASE_URL, {
      params: {
        method: "track.search",
        track: `${keyword} ${genre}`,
        api_key: LASTFM_API_KEY,
        format: "json",
        limit:10, // 원하는 곡 개수
      },
    });
    return response.data.results.trackmatches.track;
  } catch (error) {
    console.error("Last.fm API 요청 실패:", error.message)
    return [];
  }
  
}

