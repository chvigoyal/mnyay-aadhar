import React, { useState, useRef, useEffect } from 'react';
import { Send, X, MessageCircle, Bot } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

export const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I am your NYAY ADHAAR AI assistant. How can I help you today?',
      isBot: true,
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { profile } = useAuth();
  const { t } = useLanguage();
  const sessionId = useRef(crypto.randomUUID());

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getAIResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();

    if (lowerMessage.includes('dbt') || lowerMessage.includes('transfer') || lowerMessage.includes('benefit')) {
      return 'Direct Benefit Transfer (DBT) under the PCR and PoA Acts ensures timely financial assistance to victims. You can track your disbursement status in the Disbursements section. The funds are transferred directly to your Aadhaar-linked bank account.';
    }

    if (lowerMessage.includes('case') || lowerMessage.includes('register') || lowerMessage.includes('fir')) {
      return 'To register a case, navigate to the Cases section and click "Register New Case". You will need to provide incident details, FIR number, and supporting documents. Cases are tracked through CCTNS and eCourts for real-time updates.';
    }

    if (lowerMessage.includes('grievance') || lowerMessage.includes('complaint') || lowerMessage.includes('delay')) {
      return 'For any issues with your case or disbursement, you can submit a grievance in the Grievances section. Our officers will review and resolve your concern within 7 working days. Priority is given based on urgency.';
    }

    if (lowerMessage.includes('verify') || lowerMessage.includes('aadhaar') || lowerMessage.includes('digilocker')) {
      return 'Victim verification is done through Aadhaar and DigiLocker integration. Upload your identity proof and caste certificate. The verification process typically takes 2-3 business days. You will receive an email notification once verified.';
    }

    if (lowerMessage.includes('status') || lowerMessage.includes('track') || lowerMessage.includes('check')) {
      return 'You can track your case status, disbursement progress, and grievance resolution in real-time through your dashboard. All updates are also sent via SMS and email to your registered contact information.';
    }

    if (lowerMessage.includes('eligible') || lowerMessage.includes('relief') || lowerMessage.includes('amount')) {
      return 'Relief amounts vary based on the type of atrocity and case specifics. Immediate relief ranges from ₹25,000 to ₹8,25,000. Rehabilitation assistance is provided separately. Check with your District Social Welfare Officer for specific eligibility.';
    }

    if (lowerMessage.includes('document') || lowerMessage.includes('required') || lowerMessage.includes('upload')) {
      return 'Required documents include: Aadhaar card, caste certificate, FIR copy, medical reports (if applicable), bank account details with cancelled cheque, and any other supporting evidence. All documents can be uploaded through DigiLocker for secure verification.';
    }

    if (lowerMessage.includes('help') || lowerMessage.includes('support') || lowerMessage.includes('contact')) {
      return 'For immediate assistance, contact the National Commission for Scheduled Castes/Tribes helpline or your District Social Welfare Officer. Emergency cases can be escalated through the grievance system with "Urgent" priority.';
    }

    if (lowerMessage.includes('pcr') || lowerMessage.includes('poa') || lowerMessage.includes('act')) {
      return 'The PCR Act, 1955 addresses civil rights violations and untouchability. The PoA Act, 1989 specifically covers atrocities against SC/ST communities. Both acts provide legal protection, compensation, and rehabilitation for victims.';
    }

    if (lowerMessage.includes('marriage') || lowerMessage.includes('inter-caste') || lowerMessage.includes('incentive')) {
      return 'Inter-caste marriage incentive scheme provides financial assistance to couples where one partner belongs to SC/ST community. The incentive amount varies by state, typically ₹2.5 lakhs. Apply through the Social Welfare Department with marriage certificate and caste certificates.';
    }

    return 'I can help you with information about DBT, case registration, grievance submission, document requirements, disbursement tracking, and the PCR/PoA Acts. Please ask me a specific question or visit the respective section in the application.';
  };

  const handleSend = async () => {
    if (!inputValue.trim() || !profile) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      isBot: false,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    setTimeout(async () => {
      const botResponse = getAIResponse(inputValue);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponse,
        isBot: true,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);

      try {
        await supabase.from('chat_messages').insert([
          {
            user_id: profile.id,
            session_id: sessionId.current,
            message: inputValue,
            response: botResponse,
          },
        ]);
      } catch (error) {
        console.error('Error saving chat message:', error);
      }
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-2xl hover:shadow-3xl transition-all z-50 group"
      >
        <MessageCircle className="w-6 h-6" />
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center animate-pulse">
          AI
        </span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white dark:bg-slate-800 rounded-2xl shadow-2xl flex flex-col z-50 border border-slate-200 dark:border-slate-700">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 p-4 rounded-t-2xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-full">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white">{t('chat.title')}</h3>
            <p className="text-xs text-blue-100">Online 24/7</p>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="text-white hover:bg-white/20 p-1 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}>
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                message.isBot
                  ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white'
                  : 'bg-blue-600 text-white'
              }`}
            >
              <p className="text-sm leading-relaxed">{message.text}</p>
              <p className="text-xs opacity-70 mt-1">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-slate-100 dark:bg-slate-700 rounded-2xl px-4 py-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-slate-200 dark:border-slate-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={t('chat.placeholder')}
            className="flex-1 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
