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
      <div className="bg-white rounded-3xl border border-fwd-grey p-10 text-center space-y-6">
        <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center ${passed ? 'bg-fwd-green-20' : 'bg-fwd-orange-20'}`}>
          {passed ? <Award className="w-10 h-10 text-fwd-green" /> : <RotateCcw className="w-10 h-10 text-fwd-orange" />}
        </div>
        
        <div>
          <h3 className="text-2xl font-bold text-fwd-green mb-2">
            {passed ? 'Quiz completed!' : 'Keep practicing'}
          </h3>
          <p className="text-fwd-green/70">
            You scored <span className="font-bold text-fwd-green">{score}</span> out of <span className="font-bold text-fwd-green">{questions.length}</span> ({percentage}%)
          </p>
        </div>

        <div className="flex justify-center gap-4">
          <button
            onClick={handleRetry}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl border-2 border-fwd-grey font-bold text-fwd-green hover:border-fwd-green transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Retry quiz
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-fwd-grey/50 overflow-hidden shadow-soft">
      <div className="bg-fwd-orange-20 border-b border-fwd-orange-50 px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-fwd-orange text-white text-xs font-bold">
                ?
            </span>
            <h3 className="font-bold text-fwd-green">Lesson quiz</h3>
        </div>
        <span className="text-sm font-bold text-fwd-orange">
          Question {currentQuestionIndex + 1} of {questions.length}
        </span>
      </div>

      <div className="p-8 md:p-10">
        <h4 className="text-xl font-bold text-fwd-green mb-8">
          {currentQuestion.text}
        </h4>

        <div className="space-y-3 mb-8">
          {currentQuestion.options.map((option, idx) => {
            const isSelected = selectedOptionIndex === idx;
            let buttonStyle = "border-fwd-grey hover:border-fwd-orange hover:bg-fwd-orange-20";
            let icon = <div className="w-5 h-5 rounded-full border-2 border-fwd-grey" />;

            if (isAnswerChecked) {
              if (idx === currentQuestion.correctAnswerIndex) {
                buttonStyle = "bg-fwd-green-20 border-fwd-green text-fwd-green";
                icon = <CheckCircle2 className="w-5 h-5 text-fwd-green" />;
              } else if (isSelected && idx !== currentQuestion.correctAnswerIndex) {
                buttonStyle = "bg-fwd-orange-20 border-fwd-orange text-fwd-orange";
                icon = <XCircle className="w-5 h-5 text-fwd-orange" />;
              } else {
                 buttonStyle = "opacity-50 border-fwd-grey";
              }
            } else if (isSelected) {
              buttonStyle = "border-fwd-orange bg-fwd-orange text-white ring-1 ring-fwd-orange";
              icon = <div className="w-5 h-5 rounded-full border-2 border-white bg-white/20" />;
            }

            return (
              <button
                key={idx}
                onClick={() => !isAnswerChecked && setSelectedOptionIndex(idx)}
                disabled={isAnswerChecked}
                className={`w-full text-left p-5 rounded-xl border-2 transition-all flex items-center gap-4 ${buttonStyle}`}
              >
                <div className="shrink-0">{icon}</div>
                <span className="font-medium text-lg">{option}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between pt-6 border-t border-fwd-grey">
          <div className="flex-1">
             {isAnswerChecked && (
                 <div className={`flex items-center gap-2 text-sm font-bold ${isCorrect ? 'text-fwd-green' : 'text-fwd-orange'}`}>
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
              px-8 py-3 rounded-xl font-bold text-white transition-all
              ${selectedOptionIndex === null 
                ? 'bg-fwd-grey cursor-not-allowed text-fwd-green/30' 
                : 'bg-fwd-orange hover:bg-fwd-orange-80 active:translate-y-0.5 shadow-md'}
            `}
          >
            {isAnswerChecked 
                ? (currentQuestionIndex < questions.length - 1 ? 'Next question' : 'Finish quiz') 
                : 'Check answer'
            }
          </button>
        </div>
      </div>
    </div>
  );
};

export default Quiz;