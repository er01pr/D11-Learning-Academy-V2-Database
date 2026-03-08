import { Module } from './types';

export const MANAGERIAL_ROLES = [
  'Financial Wealth Manager',
  'Financial Wealth Branch Manager',
  'Financial Wealth Director',
  'Agency Partner'
];

export const CURRICULUM: Module[] = [
  {
    id: 'module-1',
    title: 'Module 1: The Fundamentals',
    lessons: [
      {
        id: 'm1-l1',
        moduleId: 'module-1',
        title: 'Lesson 1: Insurance 101',
        videoId: '5ZItnJhH428',
        summary: 'A quick (6-minute) primer on the basics of life insurance. It defines key terms (premium, beneficiary, policy owner, sum assured) and explains the fundamental purpose of getting insured.',
        quiz: [
          {
            id: 'q1',
            text: 'What is the "Sum Assured"?',
            options: [
              'The monthly payment made by the client',
              'The guaranteed amount paid out upon a claim',
              'The commission earned by the agent',
              'The total interest earned on the policy'
            ],
            correctAnswerIndex: 1
          },
          {
            id: 'q2',
            text: 'Who is the "Beneficiary"?',
            options: [
              'The person who pays the premium',
              'The insurance company issuing the policy',
              'The person designated to receive the policy proceeds',
              'The financial advisor selling the plan'
            ],
            correctAnswerIndex: 2
          },
          {
            id: 'q3',
            text: 'What is the fundamental purpose of life insurance?',
            options: [
              'To generate quick tax-free profits',
              'To replace income and provide financial protection',
              'To avoid paying all taxes',
              'To gamble on stock market trends'
            ],
            correctAnswerIndex: 1
          }
        ]
      },
      {
        id: 'm1-l2',
        moduleId: 'module-1',
        title: 'Lesson 2: Prospecting & Setting Appointments',
        videoId: 'YeEbxO1dTlU',
        summary: 'A guide on the initial stages of the sales cycle. It covers strategies for finding potential clients (prospecting) and scripts or techniques for successfully booking that first meeting.',
        resources: [
          {
            title: 'The Golden List (Prospecting Tool)',
            url: 'https://storage.googleapis.com/msgsndr/ABdnWpTWYZ2zXM9ooQVJ/media/6968d0067a8acb9acae48aef.pdf',
            type: 'pdf'
          }
        ],
        quiz: [
          {
            id: 'q1',
            text: 'What is "Prospecting"?',
            options: [
              'The process of identifying potential clients',
              'Closing the sale immediately',
              'Writing the insurance contract',
              'Calculating the commission rate'
            ],
            correctAnswerIndex: 0
          },
          {
            id: 'q2',
            text: 'When setting an appointment, what is the primary goal?',
            options: [
              'To sell the policy over the phone',
              'To secure a specific time and date for a meeting',
              'To ask for a list of 100 referrals',
              'To explain the entire policy in detail'
            ],
            correctAnswerIndex: 1
          },
          {
            id: 'q3',
            text: 'Which is a common method for prospecting?',
            options: [
              'Waiting for people to call you',
              'Asking for referrals from existing network',
              'Ignoring friends and family',
              'Only speaking to strangers on the street'
            ],
            correctAnswerIndex: 1
          }
        ]
      },
      {
        id: 'm1-l3',
        moduleId: 'module-1',
        title: 'Lesson 3: Financial Building Blocks',
        videoId: 'bgXpvQcIf94',
        summary: 'A foundational training session covering the core pillars of financial planning. It explains how to build a solid financial foundation for clients, starting from protection/insurance up to wealth accumulation and investment.',
        quiz: [
          {
            id: 'q1',
            text: 'What is usually the base of the financial building blocks?',
            options: [
              'High-risk Investments',
              'Protection / Insurance',
              'Real Estate',
              'Cryptocurrency'
            ],
            correctAnswerIndex: 1
          },
          {
            id: 'q2',
            text: 'Why should protection come before wealth accumulation?',
            options: [
              'It generates higher returns immediately',
              'To safeguard assets against unforeseen events',
              'It is required by law for all investments',
              'It is cheaper than buying stocks'
            ],
            correctAnswerIndex: 1
          },
          {
            id: 'q3',
            text: 'Which element is typically at the top of the financial pyramid?',
            options: [
              'Emergency Fund',
              'Life Insurance',
              'Wealth Accumulation / Investments',
              'Debt Management'
            ],
            correctAnswerIndex: 2
          }
        ]
      },
      {
        id: 'm1-l4',
        moduleId: 'module-1',
        title: 'Financial Need Analysis (FNA)',
        videoId: '6V_c8q9BPxA',
        summary: 'Training on conducting an FNA. This teaches agents the mathematical and consultative process of calculating exactly how much coverage a client needs based on their income, debts, and goals.',
        quiz: [
          {
            id: 'q1',
            text: 'What does FNA stand for?',
            options: [
              'Financial New Account',
              'Financial Needs Analysis',
              'Future Net Assessment',
              'Formal Notification of Assets'
            ],
            correctAnswerIndex: 1
          },
          {
            id: 'q2',
            text: 'The FNA process is primarily used to:',
            options: [
              'Impress the client with math skills',
              'Calculate the exact coverage a client requires',
              'Maximize the agent\'s commission',
              'Predict stock market trends'
            ],
            correctAnswerIndex: 1
          },
          {
            id: 'q3',
            text: 'Which factor is key in calculating financial needs?',
            options: [
              'The client\'s favorite color',
              'Income, debts, and future goals',
              'The agent\'s sales quota',
              'Global political events'
            ],
            correctAnswerIndex: 1
          }
        ]
      },
    ],
  },
  {
    id: 'module-2',
    title: 'Module 2: Product Mastery',
    lessons: [
      {
        id: 'm2-l1',
        moduleId: 'module-2',
        title: 'Set For Health',
        videoId: 'UOllcRME0u8',
        summary: 'Focused training on the "Set For Health" product. This is likely a critical illness or medical insurance plan, highlighting the specific diseases covered and the claim benefits.',
        quiz: [
          {
            id: 'q1',
            text: 'What is the primary focus of "Set For Health"?',
            options: [
              'Vehicle insurance',
              'Critical illness and medical coverage',
              'Retirement savings only',
              'Educational funding'
            ],
            correctAnswerIndex: 1
          },
          {
            id: 'q2',
            text: 'Unlike standard life insurance, this product emphasizes:',
            options: [
              'Death benefits only',
              'Living benefits for health conditions',
              'Stock market participation',
              'Property protection'
            ],
            correctAnswerIndex: 1
          },
          {
            id: 'q3',
            text: 'When can a client typically claim from this policy?',
            options: [
              'Only upon death',
              'Upon diagnosis of a covered critical illness',
              'Whenever they lose their job',
              'After the policy expires'
            ],
            correctAnswerIndex: 1
          }
        ]
      },
      {
        id: 'm2-l2',
        moduleId: 'module-2',
        title: 'Vibrant',
        videoId: 'Do3C3jtwpdE',
        summary: 'Product specific training for the "Vibrant" insurance plan. It details the product\'s unique selling propositions, investment components, and which client demographic it is best suited for.',
        quiz: [
          {
            id: 'q1',
            text: '"Vibrant" is likely best suited for which demographic?',
            options: [
              'Retired individuals over 80',
              'Clients looking for comprehensive health/investment features',
              'Clients looking for short-term car insurance',
              'Children under 5 years old'
            ],
            correctAnswerIndex: 1
          },
          {
            id: 'q2',
            text: 'Does Vibrant include an investment component?',
            options: [
              'No, it is purely term insurance',
              'Yes, it combines protection with investment',
              'Only if the client pays double',
              'It depends on the weather'
            ],
            correctAnswerIndex: 1
          },
          {
            id: 'q3',
            text: 'What is a Unique Selling Proposition (USP)?',
            options: [
              'The price of the product',
              'A feature that makes the product distinct and appealing',
              'The hidden fees',
              'The font used in the brochure'
            ],
            correctAnswerIndex: 1
          }
        ]
      },
      {
        id: 'm2-l3',
        moduleId: 'module-2',
        title: 'SmartStart',
        videoId: 'CAfQ0JYPhVU',
        summary: 'Comprehensive training on the "SmartStart" product. This session explains the features of this specific investment-linked or protection plan, likely aimed at young professionals or first-time investors.',
        quiz: [
          {
            id: 'q1',
            text: 'Who is the target audience for "SmartStart"?',
            options: [
              'High Net Worth Individuals only',
              'Young professionals or first-time investors',
              'Retirees seeking pension',
              'Corporate executives only'
            ],
            correctAnswerIndex: 1
          },
          {
            id: 'q2',
            text: 'What makes SmartStart attractive to new investors?',
            options: [
              'Extremely high premiums',
              'Complexity of the contract',
              'Accessibility and foundational features',
              'Requirement for large capital upfront'
            ],
            correctAnswerIndex: 2
          },
          {
            id: 'q3',
            text: 'Is SmartStart an investment-linked plan?',
            options: [
              'Yes, it likely has investment features',
              'No, it is a pure accident policy',
              'No, it is a bank savings account',
              'Yes, but only for cryptocurrency'
            ],
            correctAnswerIndex: 0
          }
        ]
      },
      {
        id: 'm2-l4',
        moduleId: 'module-2',
        title: 'Set For Life Plus',
        videoId: 'MSSg3qm5lKw',
        summary: 'Product training for "Set For Life Plus". It outlines the benefits of this specific plan, focusing on lifetime protection and potential wealth accumulation features.',
        quiz: [
          {
            id: 'q1',
            text: 'What is the main benefit of "Set For Life Plus"?',
            options: [
              'Temporary coverage for 1 year',
              'Lifetime protection with wealth accumulation',
              'Free medical checkups',
              'Discounted gym memberships'
            ],
            correctAnswerIndex: 1
          },
          {
            id: 'q2',
            text: '"Wealth accumulation" in this context refers to:',
            options: [
              'Winning the lottery',
              'Building cash value over time',
              'Saving money by not buying insurance',
              'Getting a loan from the bank'
            ],
            correctAnswerIndex: 1
          },
          {
            id: 'q3',
            text: 'This plan is designed to provide coverage for how long?',
            options: [
              'Until age 50',
              'For 5 years only',
              'For the insured\'s lifetime',
              'Only while employed'
            ],
            correctAnswerIndex: 2
          }
        ]
      },
      {
        id: 'm2-l5',
        moduleId: 'module-2',
        title: 'Manifest (VUL Product)',
        videoId: '_Dk8uoh_s9I',
        summary: 'Manifest is a Variable Unit-Linked (VUL) insurance plan that combines life insurance protection with an investment component. Designed for long-term goals, it features 5 or 10-year payment terms and coverage up to age 100. Key highlights include four unique bonuses (Start-Up, Loyalty, Investment Protector, and Premium Extension) and Guaranteed Milestone Increases for major life events like marriage or property purchase.',
        quiz: [
          {
            id: 'q1',
            text: 'What type of insurance plan is Manifest?',
            options: [
              'Pure Term Insurance',
              'Variable Unit-Linked (VUL)',
              'Health Maintenance Organization (HMO)',
              'Educational Trust Fund'
            ],
            correctAnswerIndex: 1
          },
          {
            id: 'q2',
            text: 'Which bonus is a safety feature that doubles the Loyalty Bonus if the PSEi is lower than it was 5 years prior?',
            options: [
              'Start-Up Bonus',
              'Premium Extension Bonus',
              'Investment Protector Bonus',
              'Guaranteed Milestone Bonus'
            ],
            correctAnswerIndex: 2
          },
          {
            id: 'q3',
            text: 'What is the "Guaranteed Milestone Increase" feature?',
            options: [
              'It automatically increases the investment value every year',
              'It allows clients to increase coverage without medical exams during major life events',
              'It provides a cash gift on the client\'s birthday',
              'It lowers the premium after 10 years'
            ],
            correctAnswerIndex: 1
          }
        ]
      },
    ],
  },
  {
    id: 'module-3',
    title: 'Module 3: Understanding Riders',
    lessons: [
      {
        id: 'm3-l1',
        moduleId: 'module-3',
        title: 'Riders Part 1',
        videoId: 'UBNmHdUcvgk',
        summary: 'An introduction to Riders (add-ons). It explains what riders are and covers the most common ones available to enhance a client\'s coverage.',
        quiz: [
          {
            id: 'q1',
            text: 'In insurance, what is a "Rider"?',
            options: [
              'The person driving the car',
              'An add-on provision to a basic policy',
              'A separate policy entirely',
              'The commission statement'
            ],
            correctAnswerIndex: 1
          },
          {
            id: 'q2',
            text: 'Why would a client add a rider?',
            options: [
              'To increase the agent\'s paperwork',
              'To customize and enhance their coverage',
              'To cancel the base policy',
              'To reduce the sum assured'
            ],
            correctAnswerIndex: 1
          },
          {
            id: 'q3',
            text: 'Which is a common example of a rider?',
            options: [
              'Accidental Death Benefit',
              'Grocery voucher',
              'Free parking',
              'Netflix subscription'
            ],
            correctAnswerIndex: 0
          }
        ]
      },
      {
        id: 'm3-l2',
        moduleId: 'module-3',
        title: 'Riders Part 2',
        videoId: 'icHtRelMBr8',
        summary: 'A continuation of the Riders training. This dives into more specific or complex supplementary benefits that can be attached to a base policy, such as accidental death or waiver of premium.',
        quiz: [
          {
            id: 'q1',
            text: 'What does a "Waiver of Premium" rider typically do?',
            options: [
              'Waives the death benefit',
              'Waives future premiums if the insured becomes disabled',
              'Waives the agent\'s commission',
              'Allows the client to pay whenever they want'
            ],
            correctAnswerIndex: 1
          },
          {
            id: 'q2',
            text: 'Are riders free?',
            options: [
              'Always',
              'Never',
              'Usually they come with an additional cost',
              'Only on Tuesdays'
            ],
            correctAnswerIndex: 2
          },
          {
            id: 'q3',
            text: 'Can riders be added to any policy?',
            options: [
              'Yes, always',
              'No, it depends on the product rules',
              'Only to car insurance',
              'Only to expired policies'
            ],
            correctAnswerIndex: 1
          }
        ]
      },
    ],
  },
  {
    id: 'module-4',
    title: 'Module 4: Sales Skills & Operations',
    lessons: [
      {
        id: 'm4-l1',
        moduleId: 'module-4',
        title: 'Handling Objections',
        videoId: 'JR77D9rz-dA',
        summary: 'A sales skill training video focusing on soft skills. It teaches agents how to professionally respond to common client hesitations (e.g., "I have no money," "I need to ask my spouse").',
        quiz: [
          {
            id: 'q1',
            text: 'What is an "Objection" in sales?',
            options: [
              'A final rejection',
              'A client\'s hesitation or concern',
              'A signed contract',
              'A referral'
            ],
            correctAnswerIndex: 1
          },
          {
            id: 'q2',
            text: 'How should you handle "I need to ask my spouse"?',
            options: [
              'Get angry and leave',
              'Acknowledge it and offer to present to the spouse',
              'Tell them they don\'t need permission',
              'Ignore the comment'
            ],
            correctAnswerIndex: 1
          },
          {
            id: 'q3',
            text: 'The goal of handling objections is to:',
            options: [
              'Win an argument',
              'Address concerns and move the sale forward',
              'Force the client to buy',
              'Prove the client wrong'
            ],
            correctAnswerIndex: 1
          }
        ]
      },
      {
        id: 'm4-l2',
        moduleId: 'module-4',
        title: 'Underwriting',
        videoId: 'SGi77Mkv71Y',
        summary: 'Explains the risk assessment process. It covers medical and financial underwriting requirements, how to classify risk (standard vs. substandard), and why certain applications might be rated or declined.',
        quiz: [
          {
            id: 'q1',
            text: 'What is "Underwriting"?',
            options: [
              'Writing the policy document',
              'The process of assessing risk',
              'Signing below the line',
              'Selling the policy'
            ],
            correctAnswerIndex: 1
          },
          {
            id: 'q2',
            text: 'What happens if a risk is deemed "Substandard"?',
            options: [
              'The application is always rejected',
              'The premium may be rated (increased)',
              'The agent gets a bonus',
              'The client gets a discount'
            ],
            correctAnswerIndex: 1
          },
          {
            id: 'q3',
            text: 'What are the two main types of underwriting mentioned?',
            options: [
              'Medical and Financial',
              'Physical and Emotional',
              'Standard and Poor',
              'Fast and Slow'
            ],
            correctAnswerIndex: 0
          }
        ]
      },
      {
        id: 'm4-l3',
        moduleId: 'module-4',
        title: 'Claims Part 1',
        videoId: 'h2Q5pfFfnho',
        summary: 'An introduction to the claims settlement process. This video guides agents on how to assist clients in filing claims, the necessary forms to prepare, and the general timeline for processing.',
        quiz: [
          {
            id: 'q1',
            text: 'What is the agent\'s role in claims?',
            options: [
              'To deny the claim',
              'To assist the client/beneficiary with requirements',
              'To pay the claim from their own pocket',
              'To ignore the client'
            ],
            correctAnswerIndex: 1
          },
          {
            id: 'q2',
            text: 'Why is proper documentation important?',
            options: [
              'To delay the process',
              'To ensure the claim is valid and processed quickly',
              'To annoy the client',
              'It is not important'
            ],
            correctAnswerIndex: 1
          },
          {
            id: 'q3',
            text: 'What is the first step when a client needs to claim?',
            options: [
              'Notify the insurance company/agent',
              'Wait 6 months',
              'Post on social media',
              'Throw away the policy'
            ],
            correctAnswerIndex: 0
          }
        ]
      },
      {
        id: 'm4-l4',
        moduleId: 'module-4',
        title: 'Claims Part 2',
        videoId: 'ghpkiUpSaIM',
        summary: 'The second part of the claims training series delivered by the Head Office. It covers advanced claims scenarios, specific documentary requirements for complex cases, or the adjudication process.',
        quiz: [
          {
            id: 'q1',
            text: 'This session likely covers:',
            options: [
              'Basic definitions only',
              'Advanced scenarios and adjudication',
              'How to sell new policies',
              'Office dress code'
            ],
            correctAnswerIndex: 1
          },
          {
            id: 'q2',
            text: 'What is "Adjudication" in claims?',
            options: [
              'Marketing the product',
              'The decision-making process to approve or deny',
              'Printing the check',
              'Mailing the letter'
            ],
            correctAnswerIndex: 1
          },
          {
            id: 'q3',
            text: 'Complex cases may require:',
            options: [
              'Less documentation',
              'Additional specific documents',
              'No investigation',
              'Immediate payment without review'
            ],
            correctAnswerIndex: 1
          }
        ]
      },
    ],
  },
];

export const INITIAL_LESSON = CURRICULUM[0].lessons[0];