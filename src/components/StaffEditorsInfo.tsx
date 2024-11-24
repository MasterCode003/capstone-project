import React, { useState } from 'react';
import { UserPlus, X, User, Edit, Trash2 } from 'lucide-react';
import { useEditors } from '../contexts/EditorsContext';
import { useDashboard } from '../contexts/DashboardContext';

const StaffEditorsInfo: React.FC = () => {
  const { editors, addEditor, removeEditor, updateEditor } = useEditors();
  const { updateStats } = useDashboard();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newEditor, setNewEditor] = useState({
    id: 0,
    firstName: '',
    middleName: '',
    lastName: '',
    position: '',
    email: '',
    department: '',
    profileLink: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewEditor({ ...newEditor, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      // Update existing editor
      updateEditor(editingId, { ...newEditor, id: editingId });
    } else {
      // Add new editor
      const editorWithId = { ...newEditor, id: Date.now() };
      addEditor(editorWithId);
    }
    updateStats();
    setIsModalOpen(false);
    setIsSuccessModalOpen(true);
    resetForm();
  };

  const resetForm = () => {
    setNewEditor({
      id: 0,
      firstName: '',
      middleName: '',
      lastName: '',
      position: '',
      email: '',
      department: '',
      profileLink: '',
    });
    setEditingId(null);
  };

  const handleEdit = (editor: any) => {
    setEditingId(editor.id);
    setNewEditor({
      ...editor
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this editor?')) {
      removeEditor(id);
      updateStats();
    }
  };

  return (
    <div className="editors-info-container">
      <div className="bg-white p-6 rounded-lg shadow-md">
        {editors.length === 0 ? (
          <p className="text-gray-500">No editors added yet.</p>
        ) : (
          <div className="space-y-4">
            {editors.map((editor) => (
              <div key={editor.id} className="flex items-center bg-gray-100 p-4 rounded-lg">
                <div className="flex-shrink-0 mr-4">
                  <User size={40} className="text-gray-500" />
                </div>
                <div className="flex-grow">
                  <h3 className="text-lg font-semibold">
                    {`${editor.firstName} ${editor.middleName} ${editor.lastName}`}
                  </h3>
                  <p className="text-blue-600 font-medium">{editor.position}</p>
                  <p className="text-gray-600">{editor.department}</p>
                  <p className="text-gray-500">{editor.email}</p>
                </div>
                <div className="flex-shrink-0 space-x-2">
                  <button onClick={() => handleEdit(editor)} className="text-blue-500 hover:text-blue-700">
                    <Edit size={20} />
                  </button>
                  <button onClick={() => handleDelete(editor.id)} className="text-red-500 hover:text-red-700">
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        <button
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors flex items-center"
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
        >
          <UserPlus className="mr-2" size={18} />
          Add Editor
        </button>
      </div>

      {/* Add/Edit Editor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">{editingId ? 'Edit Editor' : 'Add Editor'}</h3>
              <button onClick={() => {
                setIsModalOpen(false);
                resetForm();
              }} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <input
                  type="text"
                  name="firstName"
                  value={newEditor.firstName}
                  onChange={handleInputChange}
                  placeholder="First Name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div className="mb-4">
                <input
                  type="text"
                  name="middleName"
                  value={newEditor.middleName}
                  onChange={handleInputChange}
                  placeholder="Middle Name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div className="mb-4">
                <input
                  type="text"
                  name="lastName"
                  value={newEditor.lastName}
                  onChange={handleInputChange}
                  placeholder="Last Name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div className="mb-4">
                <select
                  name="position"
                  value={newEditor.position}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="">Select Position</option>
                  <option value="Chief Editor">Chief Editor</option>
                  <option value="Assistant Editor">Assistant Editor</option>
                  <option value="Director">Director</option>
                </select>
              </div>
              <div className="mb-4">
                <input
                  type="email"
                  name="email"
                  value={newEditor.email}
                  onChange={handleInputChange}
                  placeholder="Email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div className="mb-4">
                <input
                  type="text"
                  name="department"
                  value={newEditor.department}
                  onChange={handleInputChange}
                  placeholder="Department"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div className="mb-4">
                <input
                  type="url"
                  name="profileLink"
                  value={newEditor.profileLink}
                  onChange={handleInputChange}
                  placeholder="Profile Link (optional)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors flex items-center justify-center"
              >
                <UserPlus className="mr-2" size={18} />
                {editingId ? 'Update Editor' : 'Add Editor'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Success</h3>
              <button onClick={() => setIsSuccessModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <div>
                <h4 className="text-lg font-semibold">
                  {editingId ? 'Editor Updated Successfully' : 'Editor Added Successfully'}
                </h4>
                <p className="text-green-600 mt-2">Name: {newEditor.firstName} {newEditor.lastName}</p>
                <p className="text-green-600">Position: {newEditor.position}</p>
                <p className="text-green-600">Department: {newEditor.department}</p>
              </div>
            </div>
            <button
              onClick={() => setIsSuccessModalOpen(false)}
              className="w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffEditorsInfo;