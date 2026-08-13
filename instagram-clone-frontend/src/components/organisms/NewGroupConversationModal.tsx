import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { X, Check, Users } from "lucide-react";

import Avatar from "../atoms/Avatar";
import { useCreateGroupConversation } from "../../hooks/useConversation";
import { useSearchUsers } from "../../hooks/useSearch";

type User = {
  _id: string;
  name: string;
  username: string;
  profilePicture: string;
};

type Props = {
  onClose: () => void;
};

const NewGroupConversationModal = ({ onClose }: Props) => {
  const navigate = useNavigate();

  const [groupName, setGroupName] = useState("");
  const [keyword, setKeyword] = useState("");
  const [selected, setSelected] = useState<User[]>([]);

  const { data, isLoading } = useSearchUsers(keyword);
  const users: User[] = (data?.users || []).filter(
    // hide already-selected users from the list
    (u: User) => !selected.some((s) => s._id === u._id)
  );

  const createGroup = useCreateGroupConversation();

  const toggleUser = (user: User) => {
    setSelected((prev) =>
      prev.some((s) => s._id === user._id)
        ? prev.filter((s) => s._id !== user._id)
        : [...prev, user]
    );
  };

  const handleCreate = () => {
    if (!groupName.trim()) return;
    if (selected.length < 2) return;

    createGroup.mutate(
      {
        participantIds: selected.map((u) => u._id),
        groupName: groupName.trim(),
      },
      {
        onSuccess: (data) => {
          navigate(`/messages/${data.conversation._id}`);
          onClose();
        },
      }
    );
  };

  const canCreate = groupName.trim().length > 0 && selected.length >= 2;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-xl bg-white shadow-xl flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b shrink-0">
          <div className="flex items-center gap-2">
            <Users size={20} />
            <h2 className="text-lg font-bold">New Group</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">

          {/* Group name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Group name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="e.g. Weekend squad"
              maxLength={60}
              className="w-full rounded-lg border px-4 py-2.5 text-sm outline-none focus:border-blue-500 transition"
            />
          </div>

          {/* Selected members chips */}
          {selected.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">
                Members ({selected.length})
              </p>
              <div className="flex flex-wrap gap-2">
                {selected.map((u) => (
                  <button
                    key={u._id}
                    onClick={() => toggleUser(u)}
                    className="flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200 pl-1 pr-2 py-1 text-sm text-blue-700 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition group"
                    title="Remove"
                  >
                    <Avatar src={u.profilePicture} name={u.name} size={6} />
                    <span>{u.name}</span>
                    <X size={13} className="opacity-60 group-hover:opacity-100" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Search */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Add members <span className="text-xs text-gray-400">(minimum 2)</span>
            </label>
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Search users..."
              className="w-full rounded-lg border px-4 py-2.5 text-sm outline-none focus:border-blue-500 transition"
            />
          </div>

          {/* Search results */}
          <div className="space-y-1">
            {isLoading && keyword && (
              <p className="py-3 text-center text-sm text-gray-400">Searching…</p>
            )}

            {!isLoading && keyword && users.length === 0 && (
              <p className="py-3 text-center text-sm text-gray-400">No users found</p>
            )}

            {users.map((user) => {
              const isSelected = selected.some((s) => s._id === user._id);
              return (
                <button
                  key={user._id}
                  onClick={() => toggleUser(user)}
                  className="flex items-center justify-between w-full rounded-lg px-3 py-2.5 hover:bg-gray-50 transition"
                >
                  <div className="flex items-center gap-3">
                    <Avatar src={user.profilePicture} name={user.name} size={10} />
                    <div className="text-left leading-tight">
                      <p className="font-semibold text-sm">{user.name}</p>
                      <p className="text-xs text-gray-500">@{user.username}</p>
                    </div>
                  </div>

                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition ${
                      isSelected
                        ? "bg-blue-500 border-blue-500"
                        : "border-gray-300"
                    }`}
                  >
                    {isSelected && <Check size={12} className="text-white" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t shrink-0">
          {selected.length < 2 && (
            <p className="text-xs text-gray-400 mb-2 text-center">
              Select at least 2 members to create a group
            </p>
          )}
          <button
            onClick={handleCreate}
            disabled={!canCreate || createGroup.isPending}
            className="w-full rounded-xl bg-blue-500 py-2.5 text-sm font-semibold text-white hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            {createGroup.isPending ? "Creating…" : "Create Group"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewGroupConversationModal;
