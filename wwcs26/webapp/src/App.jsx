import React, { useState, useMemo, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import {
  Upload,
  Music,
  Calendar,
  BarChart3,
  FileSpreadsheet,
  TrendingUp,
  ChevronDown,
  Building2,
  Share2,
  LayoutDashboard,
  Maximize2,
  Users,
  Layers
} from 'lucide-react';

const BipartiteNetwork = ({ data, selectedArtist, showAllNodes }) => {
  const svgRef = useRef(null);

  useEffect(() => {
    if (!data || data.length === 0) return;

    let nodes = [];
    let links = [];
    const artistSet = new Set();
    const venueSet = new Set();
    const linkMap = new Map();

    if (selectedArtist) {
      // Modalità Focus: Artista Selezionato + Sue Venue + Altri Artisti in quelle Venue
      const artistVenues = new Set(data.filter(d => d.Artists === selectedArtist).map(d => d.Venue));
      const relatedPerformances = data.filter(d => artistVenues.has(d.Venue));
      const counts = {};
      
      relatedPerformances.forEach(d => {
        counts[d.Artists] = (counts[d.Artists] || 0) + 1;
      });

      // Se non è "showAll", limitiamo comunque i correlati per leggibilità
      const limit = showAllNodes ? 150 : 30;
      const topRelatedArtists = Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(e => e[0]);

      const topArtistsSet = new Set(topRelatedArtists);

      relatedPerformances.forEach(d => {
        if (topArtistsSet.has(d.Artists)) {
          artistSet.add(d.Artists);
          venueSet.add(d.Venue);
          const linkId = `${d.Artists}|${d.Venue}`;
          linkMap.set(linkId, (linkMap.get(linkId) || 0) + 1);
        }
      });
    } else {
      // Modalità Overview: Top Performers o Tutti
      const aCounts = {};
      const vCounts = {};
      data.forEach(d => {
        if (d.Artists) aCounts[d.Artists] = (aCounts[d.Artists] || 0) + 1;
        if (d.Venue) vCounts[d.Venue] = (vCounts[d.Venue] || 0) + 1;
      });

      const limit = showAllNodes ? 200 : 25;
      const topA = Object.entries(aCounts).sort((a, b) => b[1] - a[1]).slice(0, limit).map(e => e[0]);
      const topV = Object.entries(vCounts).sort((a, b) => b[1] - a[1]).slice(0, limit).map(e => e[0]);
      const topASet = new Set(topA);
      const topVSet = new Set(topV);

      data.forEach(d => {
        if (topASet.has(d.Artists) && topVSet.has(d.Venue)) {
          artistSet.add(d.Artists);
          venueSet.add(d.Venue);
          const linkId = `${d.Artists}|${d.Venue}`;
          linkMap.set(linkId, (linkMap.get(linkId) || 0) + 1);
        }
      });
    }

    const nodeArray = [
      ...Array.from(artistSet).map(name => ({ id: name, type: 'artist' })),
      ...Array.from(venueSet).map(name => ({ id: name, type: 'venue' }))
    ];

    const linkArray = Array.from(linkMap.entries()).map(([id, value]) => {
      const [source, target] = id.split('|');
      return { source, target, value };
    });

    const width = svgRef.current.clientWidth;
    const height = 650;

    const svg = d3.select(svgRef.current)
      .attr("viewBox", [0, 0, width, height]);
    
    svg.selectAll("*").remove();

    const container = svg.append("g");

    svg.call(d3.zoom()
      .scaleExtent([0.05, 5])
      .on("zoom", (event) => {
        container.attr("transform", event.transform);
      }));

    const chargeStrength = showAllNodes ? -100 : -400;
    const simulation = d3.forceSimulation(nodeArray)
      .force("link", d3.forceLink(linkArray).id(d => d.id).distance(showAllNodes ? 60 : 120))
      .force("charge", d3.forceManyBody().strength(chargeStrength))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(showAllNodes ? 25 : 55));

    const link = container.append("g")
      .attr("stroke", "#e2e8f0")
      .attr("stroke-opacity", 0.4)
      .selectAll("line")
      .data(linkArray)
      .join("line")
      .attr("stroke-width", d => Math.sqrt(d.value) + 0.5);

    const node = container.append("g")
      .selectAll("g")
      .data(nodeArray)
      .join("g")
      .call(drag(simulation));

    node.append("circle")
      .attr("r", d => d.type === 'artist' ? (showAllNodes ? 5 : 8) : (showAllNodes ? 4 : 6))
      .attr("fill", d => {
        if (d.id === selectedArtist) return "#ef4444";
        return d.type === 'artist' ? "#4f46e5" : "#10b981";
      })
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5);

    node.append("text")
      .text(d => d.id)
      .attr("x", showAllNodes ? 8 : 12)
      .attr("y", 3)
      .style("font-size", showAllNodes ? "8px" : "10px")
      .style("font-family", "sans-serif")
      .style("pointer-events", "none")
      .style("visibility", d => (showAllNodes && nodeArray.length > 150 && d.id !== selectedArtist) ? "hidden" : "visible")
      .style("font-weight", d => d.id === selectedArtist ? "bold" : "500")
      .style("fill", "#475569");

    simulation.on("tick", () => {
      link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

      node.attr("transform", d => `translate(${d.x},${d.y})`);
    });

    function drag(simulation) {
      function dragstarted(event) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
      }
      function dragged(event) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
      }
      function dragended(event) {
        if (!event.active) simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
      }
      return d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);
    }

    return () => simulation.stop();
  }, [data, selectedArtist, showAllNodes]);

  return (
    <div className="relative w-full bg-slate-50 rounded-3xl overflow-hidden border border-slate-100 shadow-inner">
      <div className="absolute top-4 left-4 z-10 flex flex-wrap gap-2">
        <div className="flex items-center gap-2 bg-white/90 backdrop-blur px-3 py-1.5 rounded-full text-[10px] font-bold border border-slate-200 shadow-sm">
          <div className="w-2 h-2 rounded-full bg-indigo-600"></div> Artist
        </div>
        <div className="flex items-center gap-2 bg-white/90 backdrop-blur px-3 py-1.5 rounded-full text-[10px] font-bold border border-slate-200 shadow-sm">
          <div className="w-2 h-2 rounded-full bg-emerald-500"></div> Venue
        </div>
        {selectedArtist && (
          <div className="flex items-center gap-2 bg-red-50 px-3 py-1.5 rounded-full text-[10px] font-bold border border-red-100 shadow-sm text-red-600">
            Target: {selectedArtist}
          </div>
        )}
      </div>
      <div className="absolute top-4 right-4 z-10 flex flex-col items-end gap-1">
        <p className="text-[10px] text-slate-400 bg-white/80 backdrop-blur px-2 py-1 rounded-md border border-slate-100 shadow-sm">
          Drag nodes • Scroll to zoom
        </p>
        <p className="text-[9px] text-slate-400">Nodes count: {showAllNodes ? 'Extended' : 'Top 50'}</p>
      </div>
      <svg ref={svgRef} className="w-full h-[650px] cursor-move"></svg>
    </div>
  );
};

const App = () => {
  const [data, setData] = useState([]);
  const [selectedArtist, setSelectedArtist] = useState('');
  const [view, setView] = useState('dashboard');
  const [showAllNodes, setShowAllNodes] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const rows = text.split('\n').map(row => row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/));
      const headers = rows[0].map(h => h.trim().replace(/"/g, ''));
      const jsonData = rows.slice(1)
        .filter(row => row.length === headers.length)
        .map(row => {
          const obj = {};
          headers.forEach((header, i) => {
            obj[header] = row[i]?.trim().replace(/"/g, '');
          });
          return obj;
        });

      setData(jsonData);
      setSelectedArtist('');
      setIsUploading(false);
    };
    reader.readAsText(file);
  };

  const sortedArtists = useMemo(() => {
    if (!data.length) return [];
    const counts = {};
    data.forEach(item => {
      if (item.Artists) counts[item.Artists] = (counts[item.Artists] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [data]);

  const artistSpecificData = useMemo(() => {
    if (!selectedArtist || !data.length) return { chart: [], venues: [] };
    const filtered = data.filter(item => item.Artists === selectedArtist);
    const monthlyCounts = {};
    
    filtered.forEach(concert => {
      const date = new Date(concert.Date);
      if (isNaN(date.getTime())) return;
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyCounts[key] = (monthlyCounts[key] || 0) + 1;
    });

    const chart = Object.keys(monthlyCounts).sort().map(key => ({
      display: new Date(key + "-01").toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      count: monthlyCounts[key]
    }));

    const venueCounts = {};
    filtered.forEach(concert => {
      const v = concert.Venue || 'Unknown';
      venueCounts[v] = (venueCounts[v] || 0) + 1;
    });

    const venues = Object.entries(venueCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    return { chart, venues };
  }, [selectedArtist, data]);

  const stats = useMemo(() => {
    if (!selectedArtist || !data.length) return null;
    const filtered = data.filter(item => item.Artists === selectedArtist);
    return {
      total: filtered.length,
      venues: [...new Set(filtered.map(i => i.Venue))].length,
      areas: [...new Set(filtered.map(i => i.Area))].length
    };
  }, [selectedArtist, data]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-4 md:p-8 pb-20">
      <div className="w-full px-4 md:px-12">
        {/* Header */}
        <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-4">
            <div className="bg-indigo-600 p-3 rounded-2xl">
              <BarChart3 className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Festival Analysis</h1>
              <p className="text-slate-500 text-sm font-medium">A WWCS 2026 project</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {data.length > 0 && (
              <div className="relative min-w-[280px]">
                <Music className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <select
                  value={selectedArtist}
                  onChange={(e) => setSelectedArtist(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm font-bold text-slate-700 cursor-pointer"
                >
                  <option value="">Search Artist...</option>
                  {sortedArtists.map(artist => (
                    <option key={artist.name} value={artist.name}>
                      {artist.name} ({artist.count})
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              </div>
            )}

            <label className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-black text-white px-5 py-3 rounded-xl cursor-pointer transition-all text-sm font-bold shadow-xl shadow-slate-200">
              <Upload size={16} />
              {data.length > 0 ? 'Update Data' : 'Import CSV'}
              <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>
        </header>

        {data.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-slate-200 rounded-[3rem] p-24 text-center">
            <div className="bg-indigo-50 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
              <FileSpreadsheet className="text-indigo-600 w-12 h-12" />
            </div>
            <h2 className="text-3xl font-black mb-3 text-slate-800 uppercase tracking-tight">Upload Dataset</h2>
            <p className="text-slate-400 max-w-sm mx-auto text-lg leading-relaxed">
              Import your concert files to visualize the artist ecosystem.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* View Switcher & Network Filters */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
              <div className="flex bg-slate-100 p-1 rounded-xl">
                <button
                  onClick={() => setView('dashboard')}
                  className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${view === 'dashboard' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:bg-white/50'}`}
                >
                  <LayoutDashboard size={16} /> Analytics
                </button>
                <button
                  onClick={() => setView('network')}
                  className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${view === 'network' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:bg-white/50'}`}
                >
                  <Share2 size={16} /> Network
                </button>
              </div>

              {view === 'network' && (
                <div className="flex bg-slate-100 p-1 rounded-xl">
                  <button
                    onClick={() => setShowAllNodes(false)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${!showAllNodes ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}
                  >
                    <Users size={14} /> Top 50
                  </button>
                  <button
                    onClick={() => setShowAllNodes(true)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${showAllNodes ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}
                  >
                    <Layers size={14} /> Show All
                  </button>
                </div>
              )}
            </div>

            {view === 'dashboard' ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {selectedArtist ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
                        <div className="bg-indigo-50 p-4 rounded-2xl text-indigo-600"><Calendar size={24} /></div>
                        <div>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Gigs</p>
                          <p className="text-3xl font-black text-slate-800">{stats.total}</p>
                        </div>
                      </div>
                      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
                        <div className="bg-emerald-50 p-4 rounded-2xl text-emerald-600"><Building2 size={24} /></div>
                        <div>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Venues</p>
                          <p className="text-3xl font-black text-slate-800">{stats.venues}</p>
                        </div>
                      </div>
                      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
                        <div className="bg-orange-50 p-4 rounded-2xl text-orange-600"><TrendingUp size={24} /></div>
                        <div>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Areas</p>
                          <p className="text-3xl font-black text-slate-800">{stats.areas}</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                        <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2 uppercase tracking-tight">Time Distribution</h3>
                        <div className="h-[300px] w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={artistSpecificData.chart}>
                              <defs>
                                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2} />
                                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                              <XAxis dataKey="display" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} dy={10} />
                              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} allowDecimals={false} />
                              <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderRadius: '16px', border: 'none', color: '#fff', padding: '12px' }} />
                              <Area type="stepAfter" dataKey="count" name="Gigs" stroke="#4f46e5" strokeWidth={4} fill="url(#colorCount)" />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                        <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2 uppercase tracking-tight">Venue Popularity</h3>
                        <div className="h-[300px] w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={artistSpecificData.venues} layout="vertical">
                              <XAxis type="number" hide />
                              <YAxis type="category" dataKey="name" width={110} axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10, fontWeight: 'bold' }} />
                              <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ backgroundColor: '#1e293b', borderRadius: '16px', border: 'none', color: '#fff' }} />
                              <Bar dataKey="count" fill="#4f46e5" radius={[0, 8, 8, 0]} barSize={24} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="bg-slate-900 rounded-[3rem] p-24 text-center text-white shadow-2xl overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500/20 via-transparent to-transparent"></div>
                    <Maximize2 className="mx-auto mb-6 text-indigo-400 animate-pulse" size={56} />
                    <h3 className="text-2xl font-black mb-2 uppercase tracking-wider">Select an Artist</h3>
                    <p className="text-slate-400 max-w-xs mx-auto text-sm font-medium">Choose from the dropdown menu to analyze their specific performance pattern.</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="animate-in zoom-in-95 duration-500">
                <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
                  <div className="mb-6 px-6 flex justify-between items-end">
                    <div>
                      <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">
                        {selectedArtist ? `Network Focus: ${selectedArtist}` : "Bipartite Network"}
                      </h3>
                      <p className="text-slate-400 text-sm font-medium">
                        {selectedArtist
                          ? `Visualizing ${selectedArtist}'s venue ecosystem.`
                          : `Visualizing the ${showAllNodes ? 'entire' : 'top'} artist-venue infrastructure.`}
                      </p>
                    </div>
                  </div>
                  <BipartiteNetwork data={data} selectedArtist={selectedArtist} showAllNodes={showAllNodes} />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default App;