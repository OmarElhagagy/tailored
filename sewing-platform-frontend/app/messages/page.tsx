'use client';

import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { format } from 'date-fns';

export default function MessagesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConversation, setActiveConversation] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingConversation, setLoadingConversation] = useState(false);
  const [attachment, setAttachment] = useState<File | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    
    fetchConversations();
  }, [router]);
  
  useEffect(() => {
    // Scroll to bottom when messages change
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  const fetchConversations = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/messages/conversations`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setConversations(response.data.data);
      setError('');
      
      // If there are conversations and none is active, select the first one
      if (response.data.data.length > 0 && !activeConversation) {
        loadConversation(response.data.data[0]._id);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load conversations');
      console.error('Error fetching conversations:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const loadConversation = async (conversationId: string) => {
    try {
      setLoadingConversation(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/messages/conversations/${conversationId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setActiveConversation(response.data.data.conversation);
      setMessages(response.data.data.messages);
      
      // Update unread count in conversation list
      setConversations(prevConversations => 
        prevConversations.map(conv => 
          conv._id === conversationId 
            ? { ...conv, unreadCount: 0 } 
            : conv
        )
      );
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load conversation');
      console.error('Error loading conversation:', err);
    } finally {
      setLoadingConversation(false);
    }
  };
  
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if ((!newMessage.trim() && !attachment) || !activeConversation) {
      return;
    }
    
    try {
      setSending(true);
      const token = localStorage.getItem('token');
      
      let response;
      
      // Send message with or without attachment
      if (attachment) {
        const formData = new FormData();
        formData.append('conversationId', activeConversation._id);
        formData.append('content', newMessage);
        formData.append('attachment', attachment);
        
        response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/api/messages/attachment`,
          formData,
          { 
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data' 
            } 
          }
        );
      } else {
        response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/api/messages`,
          {
            conversationId: activeConversation._id,
            content: newMessage
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      
      // Add new message to the list
      setMessages(prevMessages => [...prevMessages, response.data.data]);
      
      // Update last message in conversation list
      setConversations(prevConversations => 
        prevConversations.map(conv => 
          conv._id === activeConversation._id 
            ? { 
                ...conv, 
                lastMessage: response.data.data,
                updatedAt: new Date().toISOString()
              } 
            : conv
        ).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      );
      
      // Clear input
      setNewMessage('');
      setAttachment(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send message');
      console.error('Error sending message:', err);
    } finally {
      setSending(false);
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAttachment(e.target.files[0]);
    }
  };
  
  const removeAttachment = () => {
    setAttachment(null);
  };
  
  const formatMessageTime = (date: string) => {
    return format(new Date(date), 'h:mm a');
  };
  
  const formatConversationTime = (date: string) => {
    const messageDate = new Date(date);
    const today = new Date();
    
    if (messageDate.toDateString() === today.toDateString()) {
      return format(messageDate, 'h:mm a');
    } else if (messageDate.getFullYear() === today.getFullYear()) {
      return format(messageDate, 'MMM d');
    } else {
      return format(messageDate, 'MM/dd/yy');
    }
  };
  
  if (loading && conversations.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Messages</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      )}
      
      {conversations.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-lg text-gray-600 mb-4">You don't have any conversations yet</p>
          <Link 
            href="/listings" 
            className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Browse Listings
          </Link>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row gap-6">
          {/* Conversations List */}
          <div className="md:w-1/3 bg-white rounded-lg shadow overflow-hidden">
            <div className="border-b p-4">
              <h2 className="text-lg font-semibold">Conversations</h2>
            </div>
            
            <div className="divide-y overflow-y-auto" style={{ maxHeight: '600px' }}>
              {conversations.map((conversation) => (
                <div 
                  key={conversation._id}
                  className={`p-4 cursor-pointer hover:bg-gray-50 ${
                    activeConversation?._id === conversation._id ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => loadConversation(conversation._id)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative h-12 w-12 rounded-full overflow-hidden bg-gray-200">
                      {conversation.otherParticipant?.profilePhoto ? (
                        <Image
                          src={`${process.env.NEXT_PUBLIC_API_URL}/uploads/${conversation.otherParticipant.profilePhoto}`}
                          alt="Profile"
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-gray-500">
                          {conversation.otherParticipant?.firstName?.charAt(0) || '?'}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {conversation.otherParticipant?.businessName || 
                            `${conversation.otherParticipant?.firstName} ${conversation.otherParticipant?.lastName}`}
                        </h3>
                        <span className="text-xs text-gray-500">
                          {formatConversationTime(conversation.updatedAt)}
                        </span>
                      </div>
                      
                      <div className="flex items-center">
                        <p className="text-sm text-gray-500 truncate flex-1">
                          {conversation.lastMessage?.content}
                        </p>
                        
                        {conversation.unreadCount > 0 && (
                          <span className="ml-2 bg-blue-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs">
                            {conversation.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Active Conversation */}
          <div className="md:w-2/3 bg-white rounded-lg shadow overflow-hidden flex flex-col">
            {activeConversation ? (
              <>
                {/* Conversation Header */}
                <div className="border-b p-4">
                  <div className="flex items-center space-x-3">
                    <div className="relative h-10 w-10 rounded-full overflow-hidden bg-gray-200">
                      {activeConversation.participants.find((p: any) => p._id !== localStorage.getItem('userId'))?.profilePhoto ? (
                        <Image
                          src={`${process.env.NEXT_PUBLIC_API_URL}/uploads/${activeConversation.participants.find((p: any) => p._id !== localStorage.getItem('userId'))?.profilePhoto}`}
                          alt="Profile"
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-gray-500">
                          {activeConversation.participants.find((p: any) => p._id !== localStorage.getItem('userId'))?.firstName?.charAt(0) || '?'}
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <h2 className="text-lg font-semibold">
                        {activeConversation.participants.find((p: any) => p._id !== localStorage.getItem('userId'))?.businessName || 
                          `${activeConversation.participants.find((p: any) => p._id !== localStorage.getItem('userId'))?.firstName} ${activeConversation.participants.find((p: any) => p._id !== localStorage.getItem('userId'))?.lastName}`}
                      </h2>
                      <p className="text-sm text-gray-500">{activeConversation.subject}</p>
                    </div>
                  </div>
                </div>
                
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 bg-gray-50" style={{ maxHeight: '400px' }}>
                  {loadingConversation ? (
                    <div className="flex justify-center items-center h-full">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      <p>No messages yet. Start the conversation!</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((message) => {
                        const isOwn = message.senderId._id === localStorage.getItem('userId');
                        
                        return (
                          <div 
                            key={message._id}
                            className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                          >
                            <div className={`max-w-xs md:max-w-md rounded-lg p-3 ${
                              isOwn ? 'bg-blue-100' : 'bg-white border'
                            }`}>
                              <div className="flex items-start">
                                {!isOwn && (
                                  <div className="relative h-8 w-8 rounded-full overflow-hidden bg-gray-200 mr-2">
                                    {message.senderId.profilePhoto ? (
                                      <Image
                                        src={`${process.env.NEXT_PUBLIC_API_URL}/uploads/${message.senderId.profilePhoto}`}
                                        alt="Profile"
                                        fill
                                        className="object-cover"
                                      />
                                    ) : (
                                      <div className="h-full w-full flex items-center justify-center text-gray-500">
                                        {message.senderId.firstName.charAt(0)}
                                      </div>
                                    )}
                                  </div>
                                )}
                                
                                <div>
                                  <div className="flex justify-between mb-1">
                                    <span className={`text-xs font-medium ${isOwn ? 'text-blue-800' : 'text-gray-800'}`}>
                                      {isOwn ? 'You' : message.senderId.firstName}
                                    </span>
                                    <span className="text-xs text-gray-500 ml-2">
                                      {formatMessageTime(message.createdAt)}
                                    </span>
                                  </div>
                                  
                                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                  
                                  {message.attachment && (
                                    <div className="mt-2">
                                      <a
                                        href={`${process.env.NEXT_PUBLIC_API_URL}/${message.attachment}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                                      >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                        </svg>
                                        Attachment
                                      </a>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </div>
                
                {/* Message Input */}
                <form onSubmit={sendMessage} className="border-t p-4">
                  {attachment && (
                    <div className="mb-2 p-2 bg-gray-100 rounded flex justify-between items-center">
                      <span className="text-sm truncate">{attachment.name}</span>
                      <button
                        type="button"
                        onClick={removeAttachment}
                        className="text-red-600 hover:text-red-800"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  )}
                  
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => document.getElementById('file-upload')?.click()}
                      className="bg-gray-100 p-2 rounded-full hover:bg-gray-200"
                      title="Attach file"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                      </svg>
                      <input
                        id="file-upload"
                        type="file"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                    </button>
                    
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="flex-1 border rounded-full py-2 px-4"
                      placeholder="Type a message..."
                      disabled={sending}
                    />
                    
                    <button
                      type="submit"
                      className={`bg-blue-600 text-white rounded-full p-2 hover:bg-blue-700 ${
                        ((!newMessage.trim() && !attachment) || sending) ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      disabled={(!newMessage.trim() && !attachment) || sending}
                    >
                      {sending ? (
                        <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                      )}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex items-center justify-center h-96 text-center p-6">
                <div>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  <p className="text-gray-500">Select a conversation to view messages</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 