import React, { useState, useEffect } from 'react';
import { Question } from '../types';
import { CheckCircle2, XCircle, AlertCircle, RotateCcw, Award } from 'lucide-react';

interface QuizProps {
  questions: Question[];
  onScoreUpdate?: (score: number) => void;
}

const Quiz: React.FC<QuizProps> = ({ questions, onScoreUpdate }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [isQuizFinished, setIsQuizFinished] = useState(false);

  useEffect(() => {
    setCurrentQuestionIndex(0);
    setSelectedOptionIndex(null);
    setIsAnswerChecked(false);
    setScore(0);
    setIsQuizFinished(false);
  }, [questions]);

  const currentQuestion = questions[currentQuestionIndex];
  const isCorrect = selectedOptionIndex === currentQuestion.correctAnswerIndex;

  const handleCheckAnswer = () => {
    if (selectedOptionIndex === null) return;
    
    setIsAnswerChecked(true);
    if (selectedOptionIndex === currentQuestion.correctAnswerIndex) {
      setScore(prev => {
        const newScore = prev + 1;
        return newScore;
      });
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOptionIndex(null);
      setIsAnswerChecked(false);
    } else {
      setIsQuizFinished(true);
      // Reporting the final score to the DB
      if (onScoreUpdate) onScoreUpdate(score);
    }
  };

  const handleRetry = () => {
    setCurrentQuestionIndex(0);
    setSelectedOptionIndex(null);
    setIsAnswerChecked(false);
    setScore(0);
    setIsQuizFinished(false);
  };

  if (isQuizFinished) {
    const percentage = Math.round((score / questions.length) * 100);
    const passed = percentage >= 66;

    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center space-y-6">
        <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center ${passed ? 'bg-green-100' : 'bg-amber-100'}`}>
          {passed ? <Award className="w-10 h-10 text-green-600" /> : <RotateCcw className="w-10 h-10 text-amber-600" />}
        </div>
        
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            {passed ? 'Quiz Completed!' : 'Keep Practicing'}
          </h3>
          <p className="text-gray-600">
            You scored <span className="font-bold text-gray-900">{score}</span> out of <span className="font-bold text-gray-900">{questions.length}</span> ({percentage}%)
          </p>
        </div>

        <div className="flex justify-center gap-4">
          <button
            onClick={handleRetry}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg border border-gray-300 font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Retry Quiz
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="bg-corporate-50 border-b border-corporate-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-corporate-500 text-white text-xs font-bold">
                ?
            </span>
            <h3 className="font-bold text-corporate-900">Lesson Quiz</h3>
        </div>
        <span className="text-sm font-medium text-corporate-500">
          Question {currentQuestionIndex + 1} of {questions.length}
        </span>
      </div>

      <div className="p-6 md:p-8">
        <h4 className="text-lg font-semibold text-gray-900 mb-6">
          {currentQuestion.text}
        </h4>

        <div className="space-y-3 mb-8">
          {currentQuestion.options.map((option, idx) => {
            const isSelected = selectedOptionIndex === idx;
            let buttonStyle = "border-gray-200 hover:border-corporate-300 hover:bg-gray-50";
            let icon = <div className="w-5 h-5 rounded-full border border-gray-300" />;

            if (isAnswerChecked) {
              if (idx === currentQuestion.correctAnswerIndex) {
                buttonStyle = "bg-green-50 border-green-200 text-green-800";
                icon = <CheckCircle2 className="w-5 h-5 text-green-600" />;
              } else if (isSelected && idx !== currentQuestion.correctAnswerIndex) {
                buttonStyle = "bg-red-50 border-red-200 text-red-800";
                icon = <XCircle className="w-5 h-5 text-red-600" />;
              } else {
                 buttonStyle = "opacity-50 border-gray-200";
              }
            } else if (isSelected) {
              buttonStyle = "border-corporate-500 bg-corporate-50 text-corporate-900 ring-1 ring-corporate-500";
              icon = <div className="w-5 h-5 rounded-full border-[5px] border-corporate-500" />;
            }

            return (
              <button
                key={idx}
                onClick={() => !isAnswerChecked && setSelectedOptionIndex(idx)}
                disabled={isAnswerChecked}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all flex items-center gap-3 ${buttonStyle}`}
              >
                <div className="shrink-0">{icon}</div>
                <span className="font-medium">{option}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex-1">
             {isAnswerChecked && (
                 <div className={`flex items-center gap-2 text-sm font-medium ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                    {isCorrect ? (
                        <>
                            <CheckCircle2 className="w-5 h-5" />
                            Correct! Great job.
                        </>
                    ) : (
                        <>
                            <AlertCircle className="w-5 h-5" />
                            Incorrect. The correct answer is marked.
                        </>
                    )}
                 </div>
             )}
          </div>
          
          <button
            onClick={isAnswerChecked ? handleNextQuestion : handleCheckAnswer}
            disabled={selectedOptionIndex === null}
            className={`
              px-6 py-2.5 rounded-lg font-semibold text-white transition-all
              ${selectedOptionIndex === null 
                ? 'bg-gray-300 cursor-not-allowed' 
                : 'bg-corporate-500 hover:bg-corporate-600 active:translate-y-0.5 shadow-sm'}
            `}
          >
            {isAnswerChecked 
                ? (currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Quiz') 
                : 'Check Answer'
            }
          </button>
        </div>
      </div>
    </div>
  );
};

export default Quiz;