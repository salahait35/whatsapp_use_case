import React from "react";

const IndexPage = () => {
  const [isDebugModalOpen, setDebugModalOpen] = React.useState(false);
  const [isCreateModalOpen, setCreateModalOpen] = React.useState(false);

  return (
    <div className="bg-gray-100 h-screen">
      {/* Header */}
      <header className="bg-blue-600 text-white py-4 px-6 flex justify-between items-center">
        <h1 className="text-lg font-bold">Messaging App</h1>
        <div className="flex items-center space-x-4">
          <p>
            Connected as: <strong>user@example.com</strong>
          </p>
          <button
            className="bg-yellow-500 text-white px-4 py-2 rounded"
            onClick={() => setDebugModalOpen(true)}
          >
            Debug Model JSON
          </button>
          <button className="bg-red-500 text-white px-4 py-2 rounded">
            Logout
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Sidebar Contacts */}
        <aside className="w-1/3 bg-white border-r p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Contacts</h2>
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded"
              onClick={() => setCreateModalOpen(true)}
            >
              <i className="fas fa-plus mr-2"></i> New Chat
            </button>
          </div>

          {/* Contacts List */}
          <div className="overflow-y-auto h-[calc(100%-3rem)]">
            {/* Replace this mockup with dynamic data */}
            <div className="flex items-center p-2 border-b">
              <img
                src="/images/default-avatar.png"
                alt="avatar"
                className="w-12 h-12 rounded-full mr-3"
              />
              <div>
                <p className="font-bold">John Doe</p>
                <p className="text-sm text-gray-500">Last message preview...</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Chat Section */}
        <main className="flex-1 flex flex-col">
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
            {/* Messages */}
            <div className="space-y-4">
              {/* Message Received */}
              <div className="flex items-start space-x-3">
                <img
                  src="/images/default-avatar.png"
                  alt="avatar"
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <p className="bg-gray-200 text-gray-800 rounded-lg p-3">Hi! How are you?</p>
                  <p className="text-xs text-gray-500">10:30 AM</p>
                </div>
              </div>
              {/* Message Sent */}
              <div className="flex items-end justify-end space-x-3">
                <div>
                  <p className="bg-blue-600 text-white rounded-lg p-3">I'm good, thanks!</p>
                  <p className="text-xs text-gray-500 text-right">10:32 AM</p>
                </div>
              </div>
            </div>
          </div>

          {/* Message Input */}
          <div className="flex items-center border-t p-4">
            <input
              type="text"
              placeholder="Type a message..."
              className="flex-1 border border-gray-300 rounded px-4 py-2 mr-4"
            />
            <button className="bg-blue-500 text-white px-4 py-2 rounded">
              <i className="fas fa-paper-plane"></i>
            </button>
          </div>
        </main>
      </div>

      {/* Debug Model Modal */}
      {isDebugModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-lg w-1/2">
            <h2 className="text-xl font-bold mb-4">Debug Model JSON</h2>
            <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-[400px]">
              {/* Replace this with actual model JSON */}
              {`{
  "example": "This is a debug example. Replace with actual data."
}`}
            </pre>
            <button
              onClick={() => setDebugModalOpen(false)}
              className="bg-blue-500 text-white px-4 py-2 mt-4 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Create New Conversation Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-lg w-1/3">
            <h2 className="text-xl font-bold mb-4">Create New Conversation</h2>
            <div className="space-y-4">
              <input
                type="email"
                placeholder="Enter user email"
                className="w-full border border-gray-300 rounded px-4 py-2"
              />
              <div className="text-red-500 text-sm hidden" id="errorMessage">
                Error message placeholder
              </div>
            </div>
            <div className="flex justify-end mt-4 space-x-2">
              <button
                className="bg-gray-300 text-black px-4 py-2 rounded"
                onClick={() => setCreateModalOpen(false)}
              >
                Cancel
              </button>
              <button className="bg-blue-500 text-white px-4 py-2 rounded">
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IndexPage;
