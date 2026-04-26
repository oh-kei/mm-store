"use client"

import React from "react"
import { Trash2, User, Edit2, Check, X, AlertTriangle } from "lucide-react"

interface CrewMember {
  name: string
  size: string
  warning?: string
}

interface RosterTableProps {
  members: CrewMember[]
  onRemove: (index: number) => void
  onUpdate: (index: number, member: CrewMember) => void
  onClearWarning: (index: number) => void
}

export function RosterTable({ members, onRemove, onUpdate, onClearWarning }: RosterTableProps) {
  const [editingIndex, setEditingIndex] = React.useState<number | null>(null)
  const [editName, setEditName] = React.useState("")
  const [editSize, setEditSize] = React.useState("")
  const [deleteIndex, setDeleteIndex] = React.useState<number | null>(null)

  const startEditing = (idx: number, member: CrewMember) => {
    setEditingIndex(idx)
    setEditName(member.name)
    setEditSize(member.size)
  }

  const handleSave = (idx: number) => {
    onUpdate(idx, { name: editName, size: editSize })
    setEditingIndex(null)
  }

  const confirmDelete = (idx: number) => {
    setDeleteIndex(idx)
  }

  const handleDelete = () => {
    if (deleteIndex !== null) {
      onRemove(deleteIndex)
      setDeleteIndex(null)
    }
  }

  if (members.length === 0) return null

  return (
    <>
      <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
        <div className="grid grid-cols-[1fr_100px_100px] p-6 bg-slate-50 border-b border-slate-100 text-[10px] uppercase tracking-[0.2em] font-black text-slate-400">
          <span>Crew Member</span>
          <span className="text-center">Size</span>
          <span className="text-right">Action</span>
        </div>
        <div className="max-h-[500px] overflow-y-auto">
          {members.map((member, idx) => {
            const isEditing = editingIndex === idx
            return (
              <div 
                key={`${member.name}-${idx}`}
                className="grid grid-cols-[1fr_100px_100px] p-6 items-center border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors"
                id={`crew-row-${idx}`}
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
                    <User size={16} />
                  </div>
                  {isEditing ? (
                    <input
                      type="text"
                      id={`edit-name-${idx}`}
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="font-black text-slate-900 tracking-tight bg-white border border-slate-200 rounded-lg px-2 py-1 flex-1 outline-none focus:border-maritime-gold"
                    />
                  ) : (
                    <div className="flex flex-col">
                      <span className="font-black text-slate-900 tracking-tight">{member.name}</span>
                      {member.warning && (
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded">
                            <AlertTriangle size={8} />
                            {member.warning}
                          </span>
                          <button 
                            id={`ignore-warning-${idx}`}
                            onClick={() => onClearWarning(idx)}
                            className="text-[9px] font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest"
                          >
                            Ignore
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="text-center">
                  {isEditing ? (
                    <select
                      id={`edit-size-${idx}`}
                      value={editSize}
                      onChange={(e) => setEditSize(e.target.value)}
                      className="bg-white px-2 py-1 rounded-lg text-xs font-black uppercase text-slate-900 border border-slate-200 w-24 text-center outline-none focus:border-maritime-gold appearance-none cursor-pointer"
                    >
                      {["XS", "S", "M", "L", "XL"].map(size => (
                        <option key={size} value={size}>{size}</option>
                      ))}
                    </select>
                  ) : (
                    <span className="bg-slate-100 px-4 py-1.5 rounded-full text-[10px] font-black uppercase text-slate-900 border border-slate-200">
                      {member.size}
                    </span>
                  )}
                </div>
                <div className="flex justify-end gap-2">
                  {isEditing ? (
                    <>
                      <button 
                        id={`save-member-${idx}`}
                        onClick={() => handleSave(idx)}
                        className="text-green-500 hover:text-green-600 transition-colors p-2 hover:bg-green-50 rounded-xl"
                      >
                        <Check size={18} />
                      </button>
                      <button 
                        id={`cancel-edit-${idx}`}
                        onClick={() => setEditingIndex(null)}
                        className="text-slate-300 hover:text-slate-400 transition-colors p-2 hover:bg-slate-100 rounded-xl"
                      >
                        <X size={18} />
                      </button>
                    </>
                  ) : (
                    <>
                      <button 
                        id={`edit-member-${idx}`}
                        onClick={() => startEditing(idx, member)}
                        className="text-slate-200 hover:text-maritime-gold transition-colors p-2 hover:bg-maritime-gold/5 rounded-xl"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        id={`remove-member-${idx}`}
                        onClick={() => confirmDelete(idx)}
                        className="text-slate-200 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-xl"
                      >
                        <Trash2 size={18} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
        <div className="p-6 bg-slate-50 flex justify-between items-center border-t border-slate-100">
          <p className="text-[10px] uppercase tracking-widest text-slate-400 font-black">Total Crew: {members.length}</p>
          <button 
            id="export-csv"
            onClick={() => {}} 
            className="text-[10px] uppercase tracking-widest text-maritime-gold font-black hover:underline underline-offset-8"
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {deleteIndex !== null && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setDeleteIndex(null)} />
          <div className="bg-white rounded-[2.5rem] shadow-2xl p-8 max-w-sm w-full relative z-10 animate-in zoom-in-95 duration-200 border border-slate-100">
            <div className="bg-red-50 text-red-500 w-16 h-16 rounded-3xl flex items-center justify-center mb-6 mx-auto rotate-3">
              <Trash2 size={24} />
            </div>
            <div className="text-center space-y-4 mb-8">
              <h3 className="text-2xl font-black uppercase tracking-tight text-slate-900">Remove Member</h3>
              <p className="text-slate-500 text-sm font-bold leading-relaxed">
                Are you sure you want to remove <span className="text-slate-900">{members[deleteIndex]?.name}</span> from the crew roster?
              </p>
            </div>
            <div className="flex gap-3">
              <button 
                id="confirm-cancel"
                onClick={() => setDeleteIndex(null)}
                className="flex-1 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-2xl h-14 font-black uppercase tracking-widest text-[10px] transition-all"
              >
                Go Back
              </button>
              <button 
                id="confirm-remove"
                onClick={handleDelete}
                className="flex-[1.5] bg-red-500 text-white hover:bg-red-600 rounded-2xl h-14 font-black uppercase tracking-widest text-[10px] transition-all shadow-lg shadow-red-500/20"
              >
                Yes, Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
