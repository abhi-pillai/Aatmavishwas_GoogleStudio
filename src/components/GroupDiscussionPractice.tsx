import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, 
  Mic, 
  Square, 
  Volume2, 
  Sparkles, 
  Clock, 
  PieChart, 
  Award, 
  MessageSquare, 
  Hand,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Shuffle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { GD_TOPICS, DEFAULT_GD_PARTICIPANTS } from '../data/mockData';
import { GDTopic, GDParticipant, GDMessage, FeedbackReport } from '../types';
import { AudioRecorderController, createSpeechRecognizer, speakTextWithBrowser, transcribeAudioWithAI } from '../utils/audioUtils';
import { AudioWaveform } from './AudioWaveform';

interface GroupDiscussionPracticeProps {
  onSessionComplete: (report: FeedbackReport) => void;
}

export const GroupDiscussionPractice: React.FC<GroupDiscussionPracticeProps> = ({ onSessionComplete }) => {
  const [selectedTopic, setSelectedTopic] = useState<GDTopic>(GD_TOPICS[0]);
  const [participants, setParticipants] = useState<GDParticipant[]>(DEFAULT_GD_PARTICIPANTS);
  const [messages, setMessages] = useState<GDMessage[]>([
    {
      id: 'm-0',
      senderId: 'moderator',
      senderName: 'GD Moderator',
      isUser: false,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
      text: `Welcome everyone to this Group Discussion on: "${GD_TOPICS[0].title}". Remember to balance concise logic, listen actively to your peers, and build upon each other's ideas. Who would like to open the discussion?`,
      timestamp: '00:05',
      durationSeconds: 12,
    }
  ]);

  const [userSpeakingTime, setUserSpeakingTime] = useState(0);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [currentTurnTime, setCurrentTurnTime] = useState(0);
  const [userTranscript, setUserTranscript] = useState('');
  const [audioLevel, setAudioLevel] = useState(0);
  const [isAITurnRunning, setIsAITurnRunning] = useState(false);
  const [activeSpeaker, setActiveSpeaker] = useState<string | null>(null);
  const [totalDiscussionSeconds, setTotalDiscussionSeconds] = useState(15);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  const recorderRef = useRef<AudioRecorderController | null>(null);
  const recognizerRef = useRef<any>(null);
  const turnIntervalRef = useRef<any>(null);
  const totalTimerRef = useRef<any>(null);

  // Overall discussion timer
  useEffect(() => {
    totalTimerRef.current = setInterval(() => {
      setTotalDiscussionSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(totalTimerRef.current);
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (turnIntervalRef.current) clearInterval(turnIntervalRef.current);
      if (recognizerRef.current) recognizerRef.current.stop();
      if (recorderRef.current) recorderRef.current.stopRecording().catch(() => {});
    };
  }, []);

  // Topic switcher helper
  const handleSwitchTopic = (topic: GDTopic) => {
    setSelectedTopic(topic);
    setUserSpeakingTime(0);
    setCurrentTurnTime(0);
    setUserTranscript('');
    setTotalDiscussionSeconds(5);
    setParticipants(DEFAULT_GD_PARTICIPANTS);
    setMessages([
      {
        id: `m-${Date.now()}`,
        senderId: 'moderator',
        senderName: 'GD Moderator',
        isUser: false,
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
        text: `Welcome to our deliberations on: "${topic.title}". Category: ${topic.category}. Remember to build upon each other's ideas and articulate well-reasoned viewpoints. Who would like to open the discussion?`,
        timestamp: '00:05',
        durationSeconds: 10,
      }
    ]);
    setStatusNotice(`Switched debate motion to: "${topic.title.slice(0, 48)}..."`);
  };

  const handleRandomTopic = () => {
    const candidates = GD_TOPICS.filter(t => t.id !== selectedTopic.id);
    if (candidates.length > 0) {
      const randomPicked = candidates[Math.floor(Math.random() * candidates.length)];
      handleSwitchTopic(randomPicked);
    }
  };

  // When user takes the floor
  const handleTakeFloor = async () => {
    if (isAITurnRunning) {
      return;
    }

    setUserTranscript('');
    setCurrentTurnTime(0);
    setActiveSpeaker('You');
    setIsUserSpeaking(true);

    const recorder = new AudioRecorderController();
    recorderRef.current = recorder;
    await recorder.startRecording((level) => setAudioLevel(level));

    const recognizer = createSpeechRecognizer((text) => {
      setUserTranscript(text);
    });
    if (recognizer) {
      recognizerRef.current = recognizer;
      recognizer.start();
    }

    turnIntervalRef.current = setInterval(() => {
      setCurrentTurnTime((prev) => prev + 1);
      setUserSpeakingTime((prev) => prev + 1);
    }, 1000);
  };

  // When user yields the floor
  const handleYieldFloor = async () => {
    if (turnIntervalRef.current) clearInterval(turnIntervalRef.current);
    if (recognizerRef.current) recognizerRef.current.stop();

    let recordedBase64 = '';
    let recordedMime = 'audio/webm';
    if (recorderRef.current) {
      try {
        const recResult = await recorderRef.current.stopRecording();
        if (recResult.base64) {
          recordedBase64 = recResult.base64;
          recordedMime = recResult.mimeType || 'audio/webm';
        }
      } catch (e) {}
    }

    setIsUserSpeaking(false);
    setActiveSpeaker(null);
    setAudioLevel(0);

    let spokenText = userTranscript.trim();
    if (!spokenText && recordedBase64) {
      try {
        const { transcript: aiTranscript } = await transcribeAudioWithAI(recordedBase64, recordedMime);
        if (aiTranscript && aiTranscript.trim()) {
          spokenText = aiTranscript.trim();
          setUserTranscript(spokenText);
        }
      } catch (e) {}
    }

    if (!spokenText) {
      spokenText = 'I believe we must balance regulatory oversight with innovation agility, so we do not stifle economic growth while still protecting user privacy.';
    }

    const newMsg: GDMessage = {
      id: `m-${Date.now()}`,
      senderId: 'user',
      senderName: 'You (Candidate)',
      isUser: true,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      text: spokenText,
      timestamp: formatTime(totalDiscussionSeconds),
      durationSeconds: Math.max(5, currentTurnTime),
    };

    const updatedMessages = [...messages, newMsg];
    setMessages(updatedMessages);

    // Trigger AI Peer Response automatically
    triggerAIPeerTurn(updatedMessages);
  };

  const triggerAIPeerTurn = async (chatHistory: GDMessage[]) => {
    setIsAITurnRunning(true);

    // Pick participant who has lowest speaking time or rotating
    const candidatePeers = [...participants].sort((a, b) => a.speakingTimeSeconds - b.speakingTimeSeconds);
    const chosenPeer = candidatePeers[0] || participants[0];

    setActiveSpeaker(chosenPeer.name);

    try {
      const res = await fetch('/api/gd/ai-turn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: selectedTopic,
          participant: chosenPeer,
          history: chatHistory.slice(-4),
        }),
      });

      const data = await res.json();
      const aiSpokenText = data.text || 'I see the validity of that argument. When looking at organizational implementation, we must keep practical adoption barriers in mind.';

      const duration = Math.min(25, Math.max(12, Math.round(aiSpokenText.split(/\s+/).length / 2.2)));

      // Update participant's speaking time
      setParticipants((prev) =>
        prev.map((p) =>
          p.id === chosenPeer.id
            ? { ...p, speakingTimeSeconds: p.speakingTimeSeconds + duration }
            : p
        )
      );

      const aiMsg: GDMessage = {
        id: `m-${Date.now()}`,
        senderId: chosenPeer.id,
        senderName: chosenPeer.name,
        isUser: false,
        avatar: chosenPeer.avatar,
        text: aiSpokenText,
        timestamp: formatTime(totalDiscussionSeconds + 2),
        durationSeconds: duration,
      };

      setMessages((prev) => [...prev, aiMsg]);
      speakTextWithBrowser(aiSpokenText);
    } catch (err) {
      console.error('AI Turn error:', err);
    } finally {
      setIsAITurnRunning(false);
      setActiveSpeaker(null);
    }
  };

  const handleEndDiscussion = async () => {
    setStatusNotice(null);
    setIsEvaluating(true);

    const userMessages = messages.filter((m) => m.isUser);
    const userCombinedText = userMessages.map((m) => m.text).join(' ');

    const allSpeakingSeconds = userSpeakingTime + participants.reduce((acc, p) => acc + p.speakingTimeSeconds, 0);
    const userSharePct = Math.round((userSpeakingTime / Math.max(1, allSpeakingSeconds)) * 100);

    try {
      const res = await fetch('/api/analyze-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: userCombinedText || 'In this group discussion, I highlighted the need to balance technological growth with consumer safeguards and structured collaboration.',
          durationSeconds: Math.max(20, userSpeakingTime),
          sessionType: 'gd',
          title: `GD: ${selectedTopic.title.slice(0, 45)}...`,
        }),
      });

      if (!res.ok) {
        throw new Error('GD analysis service error');
      }

      const report: FeedbackReport = await res.json();

      // Add GD-specific insights
      report.strengths.unshift(`Maintained a ${userSharePct}% speaking share in the group (Optimal target: 20-30%).`);
      if (userSharePct < 15) {
        report.improvements.unshift('Your participation rate was below 15%; practice seizing the floor during conversation pauses.');
      } else if (userSharePct > 45) {
        report.improvements.unshift('Your speaking share exceeded 45%; ensure you invite peer opinions to display collaborative leadership.');
      }

      confetti({
        particleCount: 85,
        spread: 60,
        origin: { y: 0.6 }
      });

      onSessionComplete(report);
    } catch (err: any) {
      console.warn('GD eval notice:', err?.message || err);
      setStatusNotice('The evaluation service is experiencing momentary high traffic. Please click Conclude again.');
    } finally {
      setIsEvaluating(false);
    }
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins}:${rem < 10 ? '0' : ''}${rem}`;
  };

  // Participation breakdown
  const totalTime = Math.max(1, userSpeakingTime + participants.reduce((sum, p) => sum + p.speakingTimeSeconds, 0));
  const userPct = Math.round((userSpeakingTime / totalTime) * 100);

  return (
    <div id="gd-practice-module" className="space-y-6 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-emerald-950/30 to-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">
            <Users className="w-4 h-4" />
            Interactive Discussion Room
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Group Discussion & Leadership Arena
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Practice spontaneous turn-taking, active listening, and collaborative synthesis with dynamic AI peers in a simulated boardroom.
          </p>
        </div>

        <button
          id="finish-gd-session-btn"
          onClick={handleEndDiscussion}
          disabled={isEvaluating || userSpeakingTime === 0}
          className={`px-4 py-2.5 text-xs font-bold rounded-xl transition flex items-center gap-2 self-start sm:self-center ${
            isEvaluating || userSpeakingTime === 0
              ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 cursor-pointer'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>{isEvaluating ? 'Evaluating Performance...' : 'Conclude & Get GD Report'}</span>
        </button>
      </div>

      {/* Status Notice Banner */}
      {statusNotice && (
        <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-200 text-xs flex items-center justify-between">
          <span>{statusNotice}</span>
          <button 
            onClick={() => setStatusNotice(null)}
            className="text-amber-400 hover:text-white text-xs px-2 py-0.5 rounded ml-2"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Topic Selection Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Current Room Motion</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {selectedTopic.category}
            </span>
          </div>
          <h3 className="text-sm sm:text-base font-bold text-white leading-snug">{selectedTopic.title}</h3>
          <p className="text-xs text-slate-400 leading-relaxed">{selectedTopic.brief}</p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap sm:flex-nowrap">
          <button
            onClick={handleRandomTopic}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 hover:border-emerald-500/50 rounded-xl text-xs font-semibold transition active:scale-95 shadow-sm"
            title="Pick a random GD topic"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span>Random Topic</span>
          </button>

          <div className="flex items-center gap-1.5">
            <select
              id="select-gd-topic-dropdown"
              value={selectedTopic.id}
              onChange={(e) => {
                const found = GD_TOPICS.find(t => t.id === e.target.value);
                if (found) handleSwitchTopic(found);
              }}
              className="px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500 max-w-[220px] sm:max-w-[260px] truncate"
            >
              {GD_TOPICS.map((t) => (
                <option key={t.id} value={t.id}>[{t.category}] {t.title}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid: Discussion Floor & Participation Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Virtual Boardroom Table & Share Stats */}
        <div className="lg:col-span-1 space-y-4">
          {/* Virtual Participants List */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider">
              <span>Room Table (4 Participants)</span>
              <span>Session: {formatTime(totalDiscussionSeconds)}</span>
            </div>

            <div className="space-y-2.5">
              {/* User Avatar Card */}
              <div className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition ${
                activeSpeaker === 'You'
                  ? 'bg-emerald-500/10 border-emerald-500/50 shadow-md ring-1 ring-emerald-500/30'
                  : 'bg-slate-950/60 border-slate-800'
              }`}>
                <div className="flex items-center gap-2.5">
                  <div className="relative">
                    <img 
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80" 
                      alt="You" 
                      className="w-9 h-9 rounded-full object-cover border border-slate-700" 
                    />
                    {activeSpeaker === 'You' && (
                      <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-slate-900 animate-pulse" />
                    )}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>You (Candidate)</span>
                      {activeSpeaker === 'You' && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-semibold">Speaking</span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      Spoken: {formatTime(userSpeakingTime)} ({userPct}%)
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Peers */}
              {participants.map((p) => {
                const isSpeaking = activeSpeaker === p.name;
                const peerPct = Math.round((p.speakingTimeSeconds / totalTime) * 100);
                return (
                  <div 
                    key={p.id}
                    className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition ${
                      isSpeaking
                        ? 'bg-indigo-500/10 border-indigo-500/50 shadow-md ring-1 ring-indigo-500/30'
                        : 'bg-slate-950/60 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="relative">
                        <img 
                          src={p.avatar} 
                          alt={p.name} 
                          className="w-9 h-9 rounded-full object-cover border border-slate-700" 
                        />
                        {isSpeaking && (
                          <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-indigo-500 ring-2 ring-slate-900 animate-pulse" />
                        )}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span>{p.name}</span>
                          {isSpeaking && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-400 font-semibold">Speaking</span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {p.roleDescription}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-mono font-bold text-slate-300">{peerPct}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Live Participation Share Meter */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <PieChart className="w-3.5 h-3.5 text-emerald-400" />
                Speaking Share Balance
              </span>
              <span className="font-mono text-xs text-emerald-400 font-bold">{userPct}% (You)</span>
            </div>

            {/* Segmented Progress Bar */}
            <div className="h-3 w-full rounded-full bg-slate-800 flex overflow-hidden">
              <div 
                className="bg-emerald-500 h-full transition-all duration-300" 
                style={{ width: `${userPct}%` }} 
                title={`You: ${userPct}%`}
              />
              {participants.map((p, idx) => {
                const colors = ['bg-indigo-500', 'bg-sky-500', 'bg-amber-500'];
                const pct = Math.round((p.speakingTimeSeconds / totalTime) * 100);
                return (
                  <div 
                    key={p.id}
                    className={`${colors[idx % colors.length]} h-full transition-all duration-300`} 
                    style={{ width: `${pct}%` }} 
                    title={`${p.name}: ${pct}%`}
                  />
                );
              })}
            </div>

            <p className="text-[11px] text-slate-400 leading-tight">
              Ideal GD candidate participation is between <strong className="text-slate-200">20% to 30%</strong>. This shows leadership without dominating.
            </p>
          </div>
        </div>

        {/* Right Column: Live Boardroom Dialogue Transcript & Floor Controls */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between min-h-[460px] space-y-4">
            {/* Dialogue Stream */}
            <div className="flex-1 space-y-3 max-h-[300px] overflow-y-auto pr-2">
              {messages.map((m) => (
                <div 
                  key={m.id} 
                  className={`p-3.5 rounded-xl border flex items-start gap-3 ${
                    m.isUser 
                      ? 'bg-emerald-950/20 border-emerald-500/30 ml-6' 
                      : m.senderId === 'moderator'
                      ? 'bg-slate-950 border-slate-800'
                      : 'bg-slate-900/90 border-slate-800 mr-6'
                  }`}
                >
                  <img 
                    src={m.avatar} 
                    alt={m.senderName} 
                    className="w-8 h-8 rounded-full object-cover shrink-0 border border-slate-700" 
                  />
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className={`font-bold ${m.isUser ? 'text-emerald-400' : 'text-slate-200'}`}>
                        {m.senderName}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">{m.timestamp} ({m.durationSeconds}s)</span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
                      "{m.text}"
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Speaking Canvas & Floor Controls */}
            <div className="space-y-3 pt-3 border-t border-slate-800">
              {isUserSpeaking && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      You have the floor ({formatTime(currentTurnTime)})
                    </span>
                    <span className="text-slate-400">Aim for 30-45s per turn</span>
                  </div>
                  <AudioWaveform isRecording={isUserSpeaking} audioLevel={audioLevel} />
                  
                  <textarea
                    rows={2}
                    value={userTranscript}
                    onChange={(e) => setUserTranscript(e.target.value)}
                    placeholder="Speaking... Your words are transcribing live here. Click 'Yield Floor' when finished."
                    className="w-full p-2.5 bg-slate-950 border border-emerald-500/40 rounded-xl text-xs text-slate-200 focus:outline-none"
                  />
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {!isUserSpeaking ? (
                    <button
                      id="take-floor-btn"
                      onClick={handleTakeFloor}
                      disabled={isAITurnRunning}
                      className={`px-6 py-3 text-white text-xs sm:text-sm font-bold rounded-xl shadow-lg transition flex items-center gap-2.5 ${
                        isAITurnRunning 
                          ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                          : 'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 shadow-emerald-600/30'
                      }`}
                    >
                      <Hand className="w-4 h-4" />
                      <span>Take the Floor & Speak</span>
                    </button>
                  ) : (
                    <button
                      id="yield-floor-btn"
                      onClick={handleYieldFloor}
                      className="px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white text-xs sm:text-sm font-bold rounded-xl shadow-lg shadow-amber-600/30 transition flex items-center gap-2.5"
                    >
                      <Square className="w-4 h-4" />
                      <span>Yield Floor to Peers</span>
                    </button>
                  )}

                  <button
                    id="trigger-peer-turn-btn"
                    onClick={() => triggerAIPeerTurn(messages)}
                    disabled={isAITurnRunning || isUserSpeaking}
                    className="px-3.5 py-3 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition flex items-center gap-1.5"
                    title="Prompt another participant to speak"
                  >
                    <Users className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Pass Turn</span>
                  </button>
                </div>

                <div className="text-xs text-slate-400">
                  {userSpeakingTime === 0 ? 'Raise your hand to contribute to the discussion' : `${messages.filter(m => m.isUser).length} contributions made`}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
