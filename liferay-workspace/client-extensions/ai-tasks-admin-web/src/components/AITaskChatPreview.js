/**
 * @author Louis-Guillaume Durand
 */

import React, { useState } from 'react';

import Icon from './ui/Icon';
import { useAITasksContext } from '../contexts/AITasksContext';
import useChatHistory from '../hooks/useChatHistory';
import ChatMessage from './ui/ChatMessage';
import { Remark } from 'react-remark';

const AITaskChatPreview = ({ isOpen, setIsOpen }) => {
  const { selectedTask, executeTask, taskExecuting } = useAITasksContext();
  const [userInput, setUserInput] = useState('');
  const { history, addMessage, clearHistory } = useChatHistory(selectedTask.id);

  const handleSubmit = async (e) => {
    e.preventDefault();
    addMessage(userInput, 'USER');
    setUserInput('');
    const response = await executeTask(selectedTask.externalReferenceCode, userInput);
    addMessage(response.output.text || response.output.error, 'AI');
  };

  return (
    <div
      className={
        'chat-preview contextual-sidebar sidebar-light sidebar-sm contextual-sidebar-visible' +
        (isOpen ? ' chat-preview-open' : ' chat-preview-close')
      }
    >
      <div className="sidebar-header">
        <div className="component-title">
          <span className="d-flex flex-row justify-content-between text-truncate-inline">
            <span className="text-truncate">Chat Preview</span>
            <button
              className={'btn btn-default'}
              onClick={(e) => {
                e.preventDefault();
                setIsOpen(false);
              }}
            >
              <Icon name={'times'} />
            </button>
          </span>
          <button
            className={'btn btn-secondary btn-sm'}
            onClick={(e) => {
              e.preventDefault();
              clearHistory();
            }}
          >
            <Icon name={'trash'} /> Clear History
          </button>
        </div>
      </div>
      <div className="container">
        <div className="chat-preview-area d-flex flex-column">
          {history.map((message, index) => (
            <ChatMessage key={index} role={message.role}>
              <Remark>{message.text}</Remark>
            </ChatMessage>
          ))}
          {taskExecuting && (
            <ChatMessage>
              <span className="loading-dots">
                <span style={{ animationDelay: '0s' }}></span>
                <span style={{ animationDelay: '0.3s' }}></span>
                <span style={{ animationDelay: '0.6s' }}></span>
              </span>
            </ChatMessage>
          )}
        </div>
        <div className="mt-3">
          <form onSubmit={handleSubmit}>
            <div className="chat-input-wrapper form-group d-flex flex-row">
              <textarea
                className="form-control"
                id="userMessage"
                name="userMessage"
                placeholder="Your message here..."
                value={userInput}
                onChange={(e) => {
                  e.preventDefault();
                  setUserInput(e.target.value);
                }}
                onKeyDown={(e) => {
                  if ((e.key === e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                    handleSubmit(e);
                  }
                }}
              ></textarea>
              <button className="btn btn-secondary" type="submit">
                <Icon name={'stars'} />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AITaskChatPreview;
