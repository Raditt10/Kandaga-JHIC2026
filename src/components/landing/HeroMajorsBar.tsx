"use client";

import React from "react";

export interface HeroMajorLabel {
  id: string;
  code: string;
  name: string;
}

export const HERO_MAJOR_LABELS: HeroMajorLabel[] = [
  {
    id: "rpl",
    code: "RPL",
    name: "Rekayasa Perangkat Lunak",
  },
  {
    id: "kimia",
    code: "Kimia Analisis",
    name: "Analisis Kimia",
  },
  {
    id: "tkj",
    code: "TKJ",
    name: "Teknik Komputer & Jaringan",
  },
];

export default function HeroMajorsBar() {
  return (
    <div className="hero-majors-bar-wrap">
      <div className="hero-majors-bar">
        {HERO_MAJOR_LABELS.map((item) => (
          <div key={item.id} className="hero-major-col">
            <span className="hero-major-code">{item.code}</span>
            <span className="hero-major-name">{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
