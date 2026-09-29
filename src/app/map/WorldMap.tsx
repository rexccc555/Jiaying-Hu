"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useRef, useState } from "react";
import type { Map as LeafletMap } from "leaflet";
import type { Quest, Region, Story } from "@/data/game";

type Props = { regions: Region[]; quests: Quest[]; stories: Story[] };

const EARTH_RADIUS = 6_378_137;

/** Circle as a lat/lng ring, so it can be cut out of the fog polygon as a hole. */
function circleRing(lat: number, lng: number, radius: number, steps = 64): [number, number][] {
  const ring: [number, number][] = [];
  const dLat = (radius / EARTH_RADIUS) * (180 / Math.PI);
  const dLng = dLat / Math.cos((lat * Math.PI) / 180);
  for (let i = 0; i < steps; i += 1) {
    const a = (i / steps) * Math.PI * 2;
    ring.push([lat + dLat * Math.sin(a), lng + dLng * Math.cos(a)]);
  }
  return ring;
}

export function WorldMap({ regions, quests, stories }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const spawn = regions.find((r) => r.unlocked) ?? regions[0]!;
  const [activeId, setActiveId] = useState(spawn.id);

  useEffect(() => {
    let cancelled = false;
    void import("leaflet").then((L) => {
      if (cancelled || !containerRef.current || mapRef.current) return;

      const map = L.map(containerRef.current, {
        center: [spawn.lat, spawn.lng],
        zoom: 12,
        minZoom: 10,
        maxZoom: 16,
        maxBounds: L.latLngBounds([-37.25, 174.3], [-36.5, 175.35]),
        maxBoundsViscosity: 0.8,
        zoomControl: true,
        attributionControl: true,
      });
      mapRef.current = map;

      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        className: "lng-tiles",
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      const world: [number, number][] = [
        [-89, -179.9],
        [-89, 179.9],
        [89, 179.9],
        [89, -179.9],
      ];
      const holes = regions.filter((r) => r.unlocked).map((r) => circleRing(r.lat, r.lng, r.radius));
      L.polygon([world, ...holes], {
        stroke: false,
        fillColor: "#070b14",
        fillOpacity: 0.86,
        interactive: false,
      }).addTo(map);

      for (const r of regions) {
        if (r.unlocked) {
          L.circle([r.lat, r.lng], {
            radius: r.radius,
            color: "#a3e635",
            weight: 2,
            fillOpacity: 0,
            dashArray: "6 6",
            interactive: false,
          }).addTo(map);
        }
        const icon = L.divIcon({
          className: "",
          html: `<div class="lng-marker ${r.unlocked ? "lng-marker-on" : ""}">${r.unlocked ? r.name : "？？？"}</div>`,
          iconSize: [0, 0],
        });
        L.marker([r.lat, r.lng], { icon, keyboard: false })
          .on("click", () => setActiveId(r.id))
          .addTo(map);
      }
    });
    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [regions, spawn.id, spawn.lat, spawn.lng]);

  const active = regions.find((r) => r.id === activeId);
  const regionQuests = quests.filter((q) => q.regionId === activeId);
  const regionStories = stories.filter((s) => s.regionId === activeId);
  const earnedXp = regionQuests.filter((q) => q.status === "done").reduce((s, q) => s + q.xp, 0);

  const focus = (r: Region) => {
    setActiveId(r.id);
    mapRef.current?.flyTo([r.lat, r.lng], r.unlocked ? 14 : 13, { duration: 0.8 });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <div className="overflow-hidden rounded-xl border border-slate-700/60">
        <div ref={containerRef} className="h-[420px] w-full bg-[#070b14] sm:h-[520px]" />
      </div>

      <div className="space-y-4">
        <div className="panel">
          {active ? (
            <>
              <p className="font-pixel text-[10px] text-cyan-300">{active.nameEn.toUpperCase()}</p>
              <h3 className="mt-2 text-2xl font-bold text-white">{active.unlocked ? active.name : "战争迷雾"}</h3>
              {active.unlocked ? (
                <>
                  <p className="mt-1 text-sm text-slate-400">
                    {active.firstVisit ? `首次到达：${active.firstVisit}` : "已探索"}
                    {earnedXp ? ` · 在这里获得 ${earnedXp} XP` : ""}
                  </p>
                  {active.note ? <p className="mt-3 text-sm leading-relaxed text-slate-300">{active.note}</p> : null}
                  <div className="mt-5">
                    <p className="text-xs font-semibold text-slate-400">这里的任务</p>
                    {regionQuests.length ? (
                      <ul className="mt-2 space-y-1.5 text-sm">
                        {regionQuests.map((q) => (
                          <li key={q.id} className="flex justify-between gap-2">
                            <span className={q.status === "done" ? "text-lime-200" : "text-slate-300"}>
                              {q.status === "done" ? "✓ " : q.status === "failed" ? "✗ " : "· "}
                              {q.title}
                            </span>
                            <span className="shrink-0 font-pixel text-[10px] text-slate-500">+{q.xp}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-2 text-sm text-slate-500">暂无任务记录。</p>
                    )}
                  </div>
                  {regionStories.length ? (
                    <div className="mt-5">
                      <p className="text-xs font-semibold text-slate-400">发生过的故事</p>
                      <ul className="mt-2 space-y-1.5 text-sm text-slate-300">
                        {regionStories.map((s) => (
                          <li key={s.id}>
                            <span className="text-slate-500">{s.date}</span> {s.title}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </>
              ) : (
                <p className="mt-3 text-sm leading-relaxed text-slate-400">
                  这片区域还笼罩在迷雾中。玩家到达后，这里会显示当时的任务、视频、照片、花费和获得的经验值。
                </p>
              )}
            </>
          ) : null}
        </div>

        <div className="panel p-4">
          <p className="text-xs font-semibold text-slate-400">区域列表</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {regions.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => focus(r)}
                className={`rounded border px-2 py-1 text-xs transition ${
                  r.unlocked
                    ? "border-lime-400/60 bg-lime-400/15 text-lime-200"
                    : "border-slate-700 text-slate-500 hover:text-slate-300"
                } ${r.id === activeId ? "ring-1 ring-cyan-300" : ""}`}
              >
                {r.unlocked ? r.name : "？？？"}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
