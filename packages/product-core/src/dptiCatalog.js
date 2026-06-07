// Generated from ../dpti-app/src/dpti.ts by scripts/import-dpti-content.mjs.
// Do not edit the data body manually; update the source or importer instead.
export const dptiTraitTest = {
  "id": "dpti",
  "version": 1,
  "status": "published",
  "titleKo": "DPTI 개발자 성향 테스트",
  "category": "work",
  "estimatedMinutes": "3-5분",
  "questionCount": 16,
  "resultCount": 16,
  "source": {
    "appId": "dpti-app",
    "file": "src/dpti.ts",
    "importedAt": "2026-06-07"
  },
  "scoring": {
    "type": "axis-letter-majority"
  },
  "axes": [
    {
      "id": "work",
      "labelKo": "작업 환경",
      "shortLabelKo": "독립/협업",
      "letters": [
        "A",
        "T"
      ],
      "tieBreakerQuestionId": "q01",
      "letterLabelsKo": {
        "A": "독립",
        "T": "협업"
      }
    },
    {
      "id": "build",
      "labelKo": "개발 방식",
      "shortLabelKo": "창의/실용",
      "letters": [
        "C",
        "P"
      ],
      "tieBreakerQuestionId": "q05",
      "letterLabelsKo": {
        "C": "창의",
        "P": "실용"
      }
    },
    {
      "id": "solve",
      "labelKo": "문제 해결",
      "shortLabelKo": "논리/공감",
      "letters": [
        "L",
        "E"
      ],
      "tieBreakerQuestionId": "q09",
      "letterLabelsKo": {
        "L": "논리",
        "E": "공감"
      }
    },
    {
      "id": "manage",
      "labelKo": "프로젝트 관리",
      "shortLabelKo": "계획/유연",
      "letters": [
        "O",
        "F"
      ],
      "tieBreakerQuestionId": "q13",
      "letterLabelsKo": {
        "O": "계획",
        "F": "유연"
      }
    }
  ],
  "abilityLabelsKo": {
    "ALG": "알고리즘",
    "LAN": "언어 숙련",
    "PRB": "문제 해결",
    "TMW": "팀워크",
    "COM": "소통",
    "TMG": "시간 관리"
  },
  "questions": [
    {
      "id": "q01",
      "axis": "work",
      "textKo": "새 기능을 맡았을 때 더 편한 시작은?",
      "options": [
        {
          "code": "A",
          "textKo": "혼자 요구사항을 정리하고 초안을 만든다",
          "descriptionKo": "먼저 생각을 깊게 정리한 뒤 공유해요.",
          "scores": {
            "work": 1
          }
        },
        {
          "code": "T",
          "textKo": "팀과 빠르게 맞춰보고 역할을 나눈다",
          "descriptionKo": "처음부터 맥락을 맞추며 움직여요.",
          "scores": {
            "work": -1
          }
        }
      ]
    },
    {
      "id": "q02",
      "axis": "work",
      "textKo": "막힌 문제가 생기면 먼저 하는 행동은?",
      "options": [
        {
          "code": "A",
          "textKo": "스스로 재현하고 가설을 좁힌다",
          "descriptionKo": "혼자 파고들며 원인을 압축해요.",
          "scores": {
            "work": 1
          }
        },
        {
          "code": "T",
          "textKo": "동료와 맥락을 공유하고 같이 본다",
          "descriptionKo": "함께 보면 더 빨리 풀린다고 느껴요.",
          "scores": {
            "work": -1
          }
        }
      ]
    },
    {
      "id": "q03",
      "axis": "work",
      "textKo": "업무 방식에서 더 중요한 것은?",
      "options": [
        {
          "code": "A",
          "textKo": "내 리듬과 집중 시간을 지키는 것",
          "descriptionKo": "몰입할 수 있는 환경이 성과를 만들어요.",
          "scores": {
            "work": 1
          }
        },
        {
          "code": "T",
          "textKo": "팀의 진행 속도와 합을 맞추는 것",
          "descriptionKo": "흐름을 맞추는 일이 결과를 단단하게 해요.",
          "scores": {
            "work": -1
          }
        }
      ]
    },
    {
      "id": "q04",
      "axis": "work",
      "textKo": "좋은 성과를 냈다고 느끼는 순간은?",
      "options": [
        {
          "code": "A",
          "textKo": "내가 잡은 방향이 끝까지 맞았을 때",
          "descriptionKo": "개인 판단이 코드로 증명될 때 만족해요.",
          "scores": {
            "work": 1
          }
        },
        {
          "code": "T",
          "textKo": "팀이 함께 낸 결과가 매끄러울 때",
          "descriptionKo": "서로 맞물린 결과가 좋을 때 뿌듯해요.",
          "scores": {
            "work": -1
          }
        }
      ]
    },
    {
      "id": "q05",
      "axis": "build",
      "textKo": "새로운 구현을 설계할 때 더 끌리는 쪽은?",
      "options": [
        {
          "code": "C",
          "textKo": "새 구조나 패턴을 실험해본다",
          "descriptionKo": "더 나은 방식이 있을지 먼저 탐색해요.",
          "scores": {
            "build": 1
          }
        },
        {
          "code": "P",
          "textKo": "검증된 방식으로 빠르게 안정화한다",
          "descriptionKo": "예측 가능한 선택으로 결과를 만들어요.",
          "scores": {
            "build": -1
          }
        }
      ]
    },
    {
      "id": "q06",
      "axis": "build",
      "textKo": "기술 선택에서 더 설득되는 근거는?",
      "options": [
        {
          "code": "C",
          "textKo": "확장 가능성과 새로운 가능성",
          "descriptionKo": "지금보다 앞으로의 선택지를 중요하게 봐요.",
          "scores": {
            "build": 1
          }
        },
        {
          "code": "P",
          "textKo": "운영 경험과 예측 가능한 비용",
          "descriptionKo": "검증된 안정성과 유지 비용을 중요하게 봐요.",
          "scores": {
            "build": -1
          }
        }
      ]
    },
    {
      "id": "q07",
      "axis": "build",
      "textKo": "리팩터링을 시작하는 이유에 가까운 것은?",
      "options": [
        {
          "code": "C",
          "textKo": "더 좋은 표현과 구조가 떠올랐다",
          "descriptionKo": "코드가 더 명확해질 가능성에 반응해요.",
          "scores": {
            "build": 1
          }
        },
        {
          "code": "P",
          "textKo": "반복 비용이나 장애 가능성을 줄여야 한다",
          "descriptionKo": "실제 비용을 줄일 때 움직여요.",
          "scores": {
            "build": -1
          }
        }
      ]
    },
    {
      "id": "q08",
      "axis": "build",
      "textKo": "아이디어 회의에서 자주 맡는 역할은?",
      "options": [
        {
          "code": "C",
          "textKo": "다른 관점의 선택지를 넓힌다",
          "descriptionKo": "새로운 조합과 가능성을 던져요.",
          "scores": {
            "build": 1
          }
        },
        {
          "code": "P",
          "textKo": "당장 실행 가능한 범위로 정리한다",
          "descriptionKo": "현실적인 다음 액션으로 좁혀요.",
          "scores": {
            "build": -1
          }
        }
      ]
    },
    {
      "id": "q09",
      "axis": "solve",
      "textKo": "버그 리포트를 받으면 먼저 확인하는 것은?",
      "options": [
        {
          "code": "L",
          "textKo": "로그, 재현 조건, 영향 범위",
          "descriptionKo": "증거와 조건부터 맞춰봐요.",
          "scores": {
            "solve": 1
          }
        },
        {
          "code": "E",
          "textKo": "사용자가 겪은 불편과 급한 정도",
          "descriptionKo": "누가 얼마나 불편한지 먼저 봐요.",
          "scores": {
            "solve": -1
          }
        }
      ]
    },
    {
      "id": "q10",
      "axis": "solve",
      "textKo": "의견 충돌이 있을 때 더 믿는 기준은?",
      "options": [
        {
          "code": "L",
          "textKo": "데이터와 일관된 원칙",
          "descriptionKo": "판단 기준이 흔들리지 않는 게 중요해요.",
          "scores": {
            "solve": 1
          }
        },
        {
          "code": "E",
          "textKo": "상대가 우려하는 맥락과 합의 가능성",
          "descriptionKo": "납득 가능한 합의가 오래 간다고 봐요.",
          "scores": {
            "solve": -1
          }
        }
      ]
    },
    {
      "id": "q11",
      "axis": "solve",
      "textKo": "코드 리뷰에서 먼저 보이는 것은?",
      "options": [
        {
          "code": "L",
          "textKo": "조건, 경계값, 성능, 복잡도",
          "descriptionKo": "코드가 정확히 버티는지 확인해요.",
          "scores": {
            "solve": 1
          }
        },
        {
          "code": "E",
          "textKo": "읽는 사람이 이해하기 쉬운 흐름",
          "descriptionKo": "함께 유지할 사람이 편한지 확인해요.",
          "scores": {
            "solve": -1
          }
        }
      ]
    },
    {
      "id": "q12",
      "axis": "solve",
      "textKo": "우선순위를 정할 때 더 크게 보는 것은?",
      "options": [
        {
          "code": "L",
          "textKo": "시스템 리스크와 기술적 파급",
          "descriptionKo": "구조적으로 위험한 부분부터 봐요.",
          "scores": {
            "solve": 1
          }
        },
        {
          "code": "E",
          "textKo": "사용자와 팀이 지금 체감하는 문제",
          "descriptionKo": "사람들이 겪는 불편부터 줄여요.",
          "scores": {
            "solve": -1
          }
        }
      ]
    },
    {
      "id": "q13",
      "axis": "manage",
      "textKo": "스프린트를 시작할 때 더 안정적인 방식은?",
      "options": [
        {
          "code": "O",
          "textKo": "할 일과 기준을 먼저 쪼개둔다",
          "descriptionKo": "정리된 계획이 속도를 만든다고 느껴요.",
          "scores": {
            "manage": 1
          }
        },
        {
          "code": "F",
          "textKo": "큰 방향을 잡고 상황에 맞게 바꾼다",
          "descriptionKo": "변화 가능성을 열어두면 더 편해요.",
          "scores": {
            "manage": -1
          }
        }
      ]
    },
    {
      "id": "q14",
      "axis": "manage",
      "textKo": "일정이 흔들릴 때 더 자연스러운 대응은?",
      "options": [
        {
          "code": "O",
          "textKo": "범위와 순서를 다시 고정한다",
          "descriptionKo": "계획을 재정렬해서 흔들림을 줄여요.",
          "scores": {
            "manage": 1
          }
        },
        {
          "code": "F",
          "textKo": "가능한 선택지를 열어두고 조정한다",
          "descriptionKo": "상황을 보며 유연하게 맞춰요.",
          "scores": {
            "manage": -1
          }
        }
      ]
    },
    {
      "id": "q15",
      "axis": "manage",
      "textKo": "작업 보드는 어떤 상태가 편한가요?",
      "options": [
        {
          "code": "O",
          "textKo": "상태와 담당자가 명확하게 정리된 상태",
          "descriptionKo": "누가 무엇을 하는지 한눈에 보여야 해요.",
          "scores": {
            "manage": 1
          }
        },
        {
          "code": "F",
          "textKo": "중요한 흐름만 보이고 가볍게 바꿀 수 있는 상태",
          "descriptionKo": "관리 자체가 부담이 되지 않아야 해요.",
          "scores": {
            "manage": -1
          }
        }
      ]
    },
    {
      "id": "q16",
      "axis": "manage",
      "textKo": "갑자기 새로운 요구가 들어오면?",
      "options": [
        {
          "code": "O",
          "textKo": "기존 계획과 충돌부터 확인한다",
          "descriptionKo": "이미 약속한 범위를 먼저 보호해요.",
          "scores": {
            "manage": 1
          }
        },
        {
          "code": "F",
          "textKo": "일단 가능성을 보고 빠르게 적응한다",
          "descriptionKo": "변경을 기회로 보고 움직여요.",
          "scores": {
            "manage": -1
          }
        }
      ]
    }
  ],
  "results": [
    {
      "code": "ACLO",
      "titleKo": "독립적 코드 아키텍트",
      "summaryKo": "혼자 깊게 파고들어 구조를 먼저 세우는 설계형 개발자.",
      "descriptionKo": "문제를 받으면 요구사항의 뼈대와 경계부터 정리합니다. 새로운 접근을 좋아하지만, 막연한 실험보다 논리와 구조로 증명되는 해법에 마음이 움직입니다.",
      "imagePath": "/packages/product-assets/dpti/type/aclo.png",
      "shareImagePath": "/packages/product-assets/dpti/share/aclo.png",
      "strengthsKo": [
        "초기 설계와 기술 방향을 빠르게 잡아요.",
        "복잡한 문제를 작은 단위로 분해해요.",
        "한번 정한 기준을 꾸준히 지켜요."
      ],
      "watchoutsKo": [
        "혼자 충분히 생각한 뒤 공유하면 팀의 맥락이 늦게 맞춰질 수 있어요.",
        "완성도 높은 구조를 기다리다 첫 피드백이 늦어질 수 있어요."
      ],
      "collaborationKo": "초반에 설계 의도와 결정 기준을 짧게 공유하면, 독립성을 유지하면서도 팀이 같은 지도를 볼 수 있어요.",
      "shareIntroKo": "구조부터 잡고 깊게 파는 독립 설계형이에요.",
      "abilities": {
        "ALG": 90,
        "LAN": 85,
        "PRB": 80,
        "TMW": 60,
        "COM": 65,
        "TMG": 75
      },
      "career": {
        "roles": [
          "소프트웨어 아키텍트",
          "백엔드 엔지니어",
          "플랫폼 엔지니어"
        ],
        "languages": [
          "TypeScript",
          "Go",
          "Java",
          "Rust"
        ],
        "skills": [
          "시스템 설계",
          "API 설계",
          "테스트 자동화",
          "클라우드 아키텍처"
        ],
        "companyTypes": [
          "기술 깊이가 중요한 플랫폼 회사",
          "코어 인프라 팀",
          "기술 표준이 명확한 B2B SaaS"
        ]
      },
      "referenceMappings": {
        "mbti": {
          "codes": [
            "INTJ",
            "INTP"
          ],
          "confidence": "높음",
          "note": "복잡한 문제를 구조화하고 장기적인 설계 기준을 세우는 성향이 비슷해요.",
          "difference": "DPTI의 A는 내향성보다 독립 작업 선호에 가깝고, 공식 MBTI 결과는 아니에요."
        }
      },
      "vector": {
        "work": 1,
        "build": 1,
        "solve": 1,
        "manage": 1
      }
    },
    {
      "code": "ACLF",
      "titleKo": "독립 코드 탐험가",
      "summaryKo": "새로운 길을 찾고 빠르게 실험하는 독립형 문제 해결자.",
      "descriptionKo": "정답지가 없는 문제를 만나도 겁내기보다 여러 가능성을 열어봅니다. 논리적인 검증은 놓치지 않지만, 계획보다 발견의 속도를 더 믿는 편입니다.",
      "imagePath": "/packages/product-assets/dpti/type/aclf.png",
      "shareImagePath": "/packages/product-assets/dpti/share/aclf.png",
      "strengthsKo": [
        "낯선 문제에서 독특한 해법을 잘 찾아요.",
        "프로토타입과 실험으로 막힌 흐름을 뚫어요.",
        "기술적 호기심을 실제 코드로 옮겨요."
      ],
      "watchoutsKo": [
        "아이디어가 많아지면 마무리 기준이 흐려질 수 있어요.",
        "팀이 따라올 수 있도록 실험의 목적을 먼저 밝혀야 해요."
      ],
      "collaborationKo": "작게 검증할 가설과 중단 기준을 같이 정하면, 창의성을 잃지 않으면서 팀의 예측 가능성도 챙길 수 있어요.",
      "shareIntroKo": "새 해법을 실험하며 문제를 뚫는 독립 탐험형이에요.",
      "abilities": {
        "ALG": 85,
        "LAN": 80,
        "PRB": 90,
        "TMW": 65,
        "COM": 70,
        "TMG": 70
      },
      "career": {
        "roles": [
          "R&D 엔지니어",
          "프로토타입 엔지니어",
          "풀스택 엔지니어"
        ],
        "languages": [
          "Python",
          "TypeScript",
          "Rust",
          "Go"
        ],
        "skills": [
          "프로토타이핑",
          "LLM/API 연동",
          "오픈소스 탐색",
          "실험 설계"
        ],
        "companyTypes": [
          "초기 제품 탐색 스타트업",
          "신기술 PoC 팀",
          "개발자 도구 회사"
        ]
      },
      "referenceMappings": {
        "mbti": {
          "codes": [
            "ENTP",
            "INTP"
          ],
          "confidence": "높음",
          "note": "새로운 가능성을 열어보고 논리적으로 검증하는 탐색형 사고가 닮아 있어요.",
          "difference": "DPTI의 F는 판단 유보보다 변화 대응 방식에 가까워 MBTI의 P와 완전히 같지는 않아요."
        }
      },
      "vector": {
        "work": 1,
        "build": 1,
        "solve": 1,
        "manage": -1
      }
    },
    {
      "code": "ACEO",
      "titleKo": "사용자 중심 개발자",
      "summaryKo": "사용자 맥락을 혼자 깊게 정리해 완성도 있게 구현하는 타입.",
      "descriptionKo": "요구사항 뒤에 있는 사람의 상황을 읽고, 그 경험이 흐트러지지 않도록 체계적으로 구현합니다. 독립적으로 움직이되 결과물은 사용자에게 닿는 지점을 향합니다.",
      "imagePath": "/packages/product-assets/dpti/type/aceo.png",
      "shareImagePath": "/packages/product-assets/dpti/share/aceo.png",
      "strengthsKo": [
        "사용자 관점과 구현 디테일을 함께 봐요.",
        "범위와 일정 안에서 경험 품질을 지켜요.",
        "요구사항을 차분하게 구조화해요."
      ],
      "watchoutsKo": [
        "사용자 맥락을 혼자 해석하면 실제 니즈와 어긋날 수 있어요.",
        "경험 품질을 지키려다 기술적 타협이 늦어질 수 있어요."
      ],
      "collaborationKo": "초기 가정과 사용자 시나리오를 팀에 공유하면, 혼자 정리한 깊이가 제품 판단의 기준으로 잘 쓰일 수 있어요.",
      "shareIntroKo": "사용자 맥락을 구조적으로 구현하는 독립 제품형이에요.",
      "abilities": {
        "ALG": 70,
        "LAN": 75,
        "PRB": 80,
        "TMW": 65,
        "COM": 90,
        "TMG": 85
      },
      "career": {
        "roles": [
          "프론트엔드 엔지니어",
          "프로덕트 엔지니어",
          "UX 엔지니어"
        ],
        "languages": [
          "TypeScript",
          "JavaScript",
          "Kotlin",
          "Swift"
        ],
        "skills": [
          "React",
          "접근성",
          "사용자 리서치 읽기",
          "디자인 시스템"
        ],
        "companyTypes": [
          "사용자 경험이 중요한 소비자 앱",
          "프로덕트 중심 스타트업",
          "핀테크/커머스 제품팀"
        ]
      },
      "referenceMappings": {
        "mbti": {
          "codes": [
            "INFJ",
            "INTJ"
          ],
          "confidence": "보통",
          "note": "사람의 맥락을 읽되 혼자 깊게 정리하고 체계적으로 구현하는 면이 비슷해요.",
          "difference": "DPTI의 E는 감정 성향보다 사용자 맥락을 우선 보는 문제 해결 방식에 가까워요."
        }
      },
      "vector": {
        "work": 1,
        "build": 1,
        "solve": -1,
        "manage": 1
      }
    },
    {
      "code": "ACEF",
      "titleKo": "사용자 맥락 탐색가",
      "summaryKo": "사람의 불편과 맥락을 읽고 유연하게 풀어내는 개발자.",
      "descriptionKo": "정해진 답보다 상황에 맞는 해법을 찾는 데 강합니다. 사용자와 팀의 감정선을 읽고, 필요한 순간에는 방향을 바꾸며 더 나은 경험을 만듭니다.",
      "imagePath": "/packages/product-assets/dpti/type/acef.png",
      "shareImagePath": "/packages/product-assets/dpti/share/acef.png",
      "strengthsKo": [
        "사용자 피드백을 빠르게 해석해요.",
        "변화하는 요구에 부드럽게 적응해요.",
        "기술과 사람 사이의 간극을 줄여요."
      ],
      "watchoutsKo": [
        "상황을 많이 고려하다 결정이 늦어질 수 있어요.",
        "명확한 기준 없이 유연하게 움직이면 범위가 커질 수 있어요."
      ],
      "collaborationKo": "공감한 문제를 구체적인 기준과 작은 작업으로 바꾸면, 팀이 바로 실행할 수 있는 힘이 생겨요.",
      "shareIntroKo": "사람의 불편을 읽고 유연하게 코드로 바꾸는 타입이에요.",
      "abilities": {
        "ALG": 65,
        "LAN": 70,
        "PRB": 85,
        "TMW": 60,
        "COM": 95,
        "TMG": 75
      },
      "career": {
        "roles": [
          "프로덕트 엔지니어",
          "UX 엔지니어",
          "QA/사용성 엔지니어"
        ],
        "languages": [
          "TypeScript",
          "Python",
          "JavaScript",
          "Swift"
        ],
        "skills": [
          "프로토타입",
          "사용자 피드백 분석",
          "A/B 테스트",
          "디자인 시스템"
        ],
        "companyTypes": [
          "빠른 실험형 제품팀",
          "사용자 피드백이 많은 서비스",
          "초기 스타트업"
        ]
      },
      "referenceMappings": {
        "mbti": {
          "codes": [
            "INFP",
            "ENFP"
          ],
          "confidence": "보통",
          "note": "사람의 불편을 민감하게 읽고 상황에 맞는 대안을 찾는 흐름이 닮아 있어요.",
          "difference": "DPTI는 개발 업무 선택을 기준으로 보므로 MBTI의 정서/사회성 지표와 직접 대응되지는 않아요."
        }
      },
      "vector": {
        "work": 1,
        "build": 1,
        "solve": -1,
        "manage": -1
      }
    },
    {
      "code": "APLO",
      "titleKo": "실행 설계자",
      "summaryKo": "명확한 계획과 실용적인 선택으로 실행 흐름을 설계하는 타입.",
      "descriptionKo": "불필요한 복잡도를 줄이고, 지금 필요한 결과를 안정적으로 내는 데 집중합니다. 혼자서도 우선순위와 일정을 잘 쪼개며 품질과 속도의 균형을 잡습니다.",
      "imagePath": "/packages/product-assets/dpti/type/aplo.png",
      "shareImagePath": "/packages/product-assets/dpti/share/aplo.png",
      "strengthsKo": [
        "일정, 범위, 품질 기준을 분명하게 잡아요.",
        "검증된 방식으로 빠르게 안정화해요.",
        "반복 작업을 줄이는 개선점을 잘 찾아요."
      ],
      "watchoutsKo": [
        "새로운 가능성을 너무 빨리 배제할 수 있어요.",
        "효율 기준이 강하면 팀원에게 여유가 적게 느껴질 수 있어요."
      ],
      "collaborationKo": "효율적인 계획 뒤에 왜 이 순서가 좋은지 설명하면, 팀이 속도뿐 아니라 판단 기준까지 함께 가져갈 수 있어요.",
      "shareIntroKo": "계획과 실용성으로 실행 흐름을 만드는 타입이에요.",
      "abilities": {
        "ALG": 80,
        "LAN": 85,
        "PRB": 80,
        "TMW": 70,
        "COM": 65,
        "TMG": 95
      },
      "career": {
        "roles": [
          "백엔드 엔지니어",
          "시스템 엔지니어",
          "데이터베이스 엔지니어"
        ],
        "languages": [
          "Java",
          "Go",
          "Python",
          "SQL"
        ],
        "skills": [
          "API 운영",
          "DB 설계",
          "CI/CD",
          "성능 최적화"
        ],
        "companyTypes": [
          "안정성이 중요한 B2B SaaS",
          "금융/핀테크 플랫폼",
          "운영 기준이 명확한 팀"
        ]
      },
      "referenceMappings": {
        "mbti": {
          "codes": [
            "ISTJ",
            "INTJ"
          ],
          "confidence": "높음",
          "note": "명확한 기준, 계획, 검증된 실행 방식을 선호하는 점이 비슷해요.",
          "difference": "DPTI의 P는 실용적 개발 방식이라는 뜻이라 MBTI의 P와는 반대 개념으로 읽으면 안 돼요."
        }
      },
      "vector": {
        "work": 1,
        "build": -1,
        "solve": 1,
        "manage": 1
      }
    },
    {
      "code": "APLF",
      "titleKo": "코드 트러블슈터",
      "summaryKo": "현실적인 감각으로 문제를 좁히고 빠르게 복구하는 해결사.",
      "descriptionKo": "장애나 버그 앞에서 침착하게 원인을 좁히고, 가장 효과적인 해결책부터 적용합니다. 계획보다 현장의 단서에 민감하며 혼자서도 빠른 복구력을 보여줍니다.",
      "imagePath": "/packages/product-assets/dpti/type/aplf.png",
      "shareImagePath": "/packages/product-assets/dpti/share/aplf.png",
      "strengthsKo": [
        "재현, 원인 분석, 우회책 판단이 빨라요.",
        "도구와 로그를 실용적으로 활용해요.",
        "불확실한 상황에서도 손을 놓지 않아요."
      ],
      "watchoutsKo": [
        "빠른 해결에 집중하다 근본 개선을 미룰 수 있어요.",
        "혼자 처리한 맥락이 문서로 남지 않으면 반복 문제가 생길 수 있어요."
      ],
      "collaborationKo": "복구 후에 원인, 임시 조치, 후속 개선을 짧게 남기면 개인의 해결력이 팀의 자산으로 바뀝니다.",
      "shareIntroKo": "문제를 빠르게 좁히고 복구하는 현실 해결형이에요.",
      "abilities": {
        "ALG": 80,
        "LAN": 90,
        "PRB": 95,
        "TMW": 70,
        "COM": 70,
        "TMG": 75
      },
      "career": {
        "roles": [
          "백엔드 엔지니어",
          "SRE",
          "QA 자동화 엔지니어"
        ],
        "languages": [
          "Python",
          "Go",
          "Java",
          "Bash"
        ],
        "skills": [
          "로그 분석",
          "모니터링",
          "장애 대응",
          "테스트 자동화"
        ],
        "companyTypes": [
          "트래픽 많은 플랫폼",
          "인프라/운영팀",
          "품질 개선이 중요한 조직"
        ]
      },
      "referenceMappings": {
        "mbti": {
          "codes": [
            "ISTP",
            "INTP"
          ],
          "confidence": "높음",
          "note": "현장에서 단서를 모아 원인을 좁히고 실용적으로 해결하는 방식이 닮아 있어요.",
          "difference": "DPTI의 유연함은 업무 대응 방식에 대한 설명이고, 생활 전반의 선호를 말하지는 않아요."
        }
      },
      "vector": {
        "work": 1,
        "build": -1,
        "solve": 1,
        "manage": -1
      }
    },
    {
      "code": "APEO",
      "titleKo": "고객 친화적 개발자",
      "summaryKo": "현실적인 구현과 고객 맥락을 균형 있게 챙기는 타입.",
      "descriptionKo": "고객이 겪는 문제를 구체적인 작업으로 바꾸고, 일정 안에서 납득 가능한 결과를 만듭니다. 감정적인 니즈를 읽지만 실행은 계획적으로 가져갑니다.",
      "imagePath": "/packages/product-assets/dpti/type/apeo.png",
      "shareImagePath": "/packages/product-assets/dpti/share/apeo.png",
      "strengthsKo": [
        "고객 요구를 개발 언어로 잘 번역해요.",
        "우선순위와 마감 기준을 잘 세워요.",
        "불편을 줄이는 현실적인 개선에 강해요."
      ],
      "watchoutsKo": [
        "고객의 급한 요청을 모두 끌어안으면 집중이 흐려질 수 있어요.",
        "기술적 리스크를 제품 언어로 설명하는 연습이 필요해요."
      ],
      "collaborationKo": "고객 영향도와 개발 비용을 같이 보여주면, 팀이 감정적인 압박 없이 좋은 결정을 내릴 수 있어요.",
      "shareIntroKo": "고객 문제를 현실적인 구현으로 풀어내는 타입이에요.",
      "abilities": {
        "ALG": 70,
        "LAN": 80,
        "PRB": 85,
        "TMW": 80,
        "COM": 95,
        "TMG": 90
      },
      "career": {
        "roles": [
          "솔루션 엔지니어",
          "프로덕트 엔지니어",
          "고객 기술지원 개발자"
        ],
        "languages": [
          "TypeScript",
          "Python",
          "Java",
          "SQL"
        ],
        "skills": [
          "API 연동",
          "요구사항 분석",
          "문서화",
          "고객 커뮤니케이션"
        ],
        "companyTypes": [
          "B2B SaaS",
          "고객 성공 조직이 강한 회사",
          "엔터프라이즈 솔루션 회사"
        ]
      },
      "referenceMappings": {
        "mbti": {
          "codes": [
            "ISFJ",
            "INFJ"
          ],
          "confidence": "보통",
          "note": "상대의 필요를 읽고 차분하게 실행 가능한 형태로 정리하는 면이 비슷해요.",
          "difference": "DPTI는 개발 결과물과 협업 상황을 중심으로 보기 때문에 성격 전체를 대체하지 않아요."
        }
      },
      "vector": {
        "work": 1,
        "build": -1,
        "solve": -1,
        "manage": 1
      }
    },
    {
      "code": "APEF",
      "titleKo": "유연한 소프트웨어 조언자",
      "summaryKo": "사람과 상황을 읽고 실용적인 다음 수를 제안하는 타입.",
      "descriptionKo": "정답을 강하게 밀기보다 상황에 맞는 선택지를 제시합니다. 변화가 많은 환경에서 부담을 줄이고, 팀이나 고객이 바로 움직일 수 있는 해법을 찾습니다.",
      "imagePath": "/packages/product-assets/dpti/type/apef.png",
      "shareImagePath": "/packages/product-assets/dpti/share/apef.png",
      "strengthsKo": [
        "상황 변화에 맞춰 현실적인 대안을 찾아요.",
        "기술적 선택을 쉬운 언어로 풀어줘요.",
        "불확실한 요구를 실행 가능한 작업으로 바꿔요."
      ],
      "watchoutsKo": [
        "너무 많은 대안을 열어두면 결정이 늦어질 수 있어요.",
        "명확한 기준 없이 조율을 계속하면 본인의 집중 시간이 줄어들 수 있어요."
      ],
      "collaborationKo": "선택지마다 비용과 기대 효과를 붙여주면, 조언이 곧 의사결정 자료가 됩니다.",
      "shareIntroKo": "상황에 맞는 실용적 조언을 잘 내는 유연형이에요.",
      "abilities": {
        "ALG": 75,
        "LAN": 85,
        "PRB": 90,
        "TMW": 90,
        "COM": 80,
        "TMG": 80
      },
      "career": {
        "roles": [
          "솔루션 엔지니어",
          "테크니컬 컨설턴트",
          "풀스택 개발자"
        ],
        "languages": [
          "Python",
          "TypeScript",
          "Ruby",
          "Kotlin"
        ],
        "skills": [
          "요구사항 정리",
          "빠른 PoC",
          "기술 문서화",
          "애자일 협업"
        ],
        "companyTypes": [
          "프로젝트형 컨설팅 조직",
          "B2B 솔루션 팀",
          "고객 맞춤 개발사"
        ]
      },
      "referenceMappings": {
        "mbti": {
          "codes": [
            "INFP",
            "ISFP"
          ],
          "confidence": "보통",
          "note": "상황과 사람의 맥락을 보면서 부담을 줄이는 현실적인 선택을 찾는 점이 비슷해요.",
          "difference": "DPTI의 추천은 개발 업무에서 드러나는 행동 패턴 기준이라 MBTI와 1:1 매칭은 아니에요."
        }
      },
      "vector": {
        "work": 1,
        "build": -1,
        "solve": -1,
        "manage": -1
      }
    },
    {
      "code": "TCLO",
      "titleKo": "협업적 기술 혁신가",
      "summaryKo": "팀의 아이디어를 구조화해 기술적 방향으로 밀어주는 타입.",
      "descriptionKo": "혼자만의 해법보다 팀 안에서 더 좋은 해법이 나온다고 믿습니다. 새로운 시도를 좋아하지만, 논리와 계획으로 팀이 따라올 수 있게 길을 만듭니다.",
      "imagePath": "/packages/product-assets/dpti/type/tclo.png",
      "shareImagePath": "/packages/product-assets/dpti/share/tclo.png",
      "strengthsKo": [
        "아이디어를 기술 전략으로 연결해요.",
        "팀의 논의를 구조화하고 방향을 잡아요.",
        "새 기술을 도입할 때 기준을 함께 세워요."
      ],
      "watchoutsKo": [
        "새로운 방향에 팀 에너지를 많이 쓰게 만들 수 있어요.",
        "합의를 중시하다 실험 속도가 늦어질 수 있어요."
      ],
      "collaborationKo": "실험의 목적, 성공 기준, 롤백 기준을 함께 정하면 혁신과 안정성을 동시에 챙길 수 있어요.",
      "shareIntroKo": "팀과 함께 새로운 기술 방향을 만드는 혁신형이에요.",
      "abilities": {
        "ALG": 80,
        "LAN": 85,
        "PRB": 80,
        "TMW": 95,
        "COM": 90,
        "TMG": 75
      },
      "career": {
        "roles": [
          "테크 리드",
          "플랫폼 엔지니어",
          "솔루션 아키텍트"
        ],
        "languages": [
          "TypeScript",
          "Java",
          "Go",
          "Python"
        ],
        "skills": [
          "기술 전략",
          "아키텍처 리뷰",
          "RFC 작성",
          "팀 기술 표준"
        ],
        "companyTypes": [
          "기술 도입이 활발한 플랫폼 회사",
          "성장 중인 스타트업",
          "기술 조직이 큰 회사"
        ]
      },
      "referenceMappings": {
        "mbti": {
          "codes": [
            "ENTJ",
            "ENTP"
          ],
          "confidence": "높음",
          "note": "아이디어를 팀의 기술 방향으로 만들고 기준을 세우는 성향이 비슷해요.",
          "difference": "DPTI의 T는 외향성보다 팀 기반 작업 선호에 가까워 MBTI의 E와 완전히 같지는 않아요."
        }
      },
      "vector": {
        "work": -1,
        "build": 1,
        "solve": 1,
        "manage": 1
      }
    },
    {
      "code": "TCLF",
      "titleKo": "팀 코드 실험가",
      "summaryKo": "팀 흐름 안에서 창의적인 구현을 빠르게 맞춰가는 타입.",
      "descriptionKo": "동료의 아이디어를 받아 새로운 구현으로 연결하는 데 능숙합니다. 계획이 바뀌어도 팀과 함께 방향을 조정하며, 코드로 가능한 선택지를 넓힙니다.",
      "imagePath": "/packages/product-assets/dpti/type/tclf.png",
      "shareImagePath": "/packages/product-assets/dpti/share/tclf.png",
      "strengthsKo": [
        "팀의 아이디어를 빠르게 코드로 실험해요.",
        "변화하는 역할과 요구에 잘 적응해요.",
        "여러 기술 스택을 연결하는 감각이 있어요."
      ],
      "watchoutsKo": [
        "팀 요청을 많이 받으면 본인 작업의 경계가 흐려질 수 있어요.",
        "실험 결과를 정리하지 않으면 다음 사람이 이어받기 어려워요."
      ],
      "collaborationKo": "실험한 내용과 남은 질문을 짧게 기록하면, 팀의 속도와 창의성이 오래 유지됩니다.",
      "shareIntroKo": "팀 안에서 아이디어를 코드로 빠르게 실험하는 타입이에요.",
      "abilities": {
        "ALG": 75,
        "LAN": 90,
        "PRB": 85,
        "TMW": 95,
        "COM": 85,
        "TMG": 70
      },
      "career": {
        "roles": [
          "풀스택 엔지니어",
          "프론트엔드 엔지니어",
          "프로토타입 엔지니어"
        ],
        "languages": [
          "TypeScript",
          "Python",
          "JavaScript",
          "Swift"
        ],
        "skills": [
          "React",
          "API 연동",
          "해커톤식 실험",
          "모듈 통합"
        ],
        "companyTypes": [
          "크로스펑셔널 제품팀",
          "초기 스타트업",
          "개발자 경험 도구 팀"
        ]
      },
      "referenceMappings": {
        "mbti": {
          "codes": [
            "ENTP",
            "INTP"
          ],
          "confidence": "보통",
          "note": "팀 아이디어를 빠르게 실험하고 가능한 선택지를 넓히는 방식이 닮아 있어요.",
          "difference": "팀 안에서 에너지를 얻는다는 뜻은 아니며, DPTI는 협업 방식의 선호를 중심으로 봐요."
        }
      },
      "vector": {
        "work": -1,
        "build": 1,
        "solve": 1,
        "manage": -1
      }
    },
    {
      "code": "TCEO",
      "titleKo": "UX 구현 조율가",
      "summaryKo": "사용자 경험과 팀 합의를 체계적으로 이어주는 타입.",
      "descriptionKo": "사용자에게 보이는 흐름과 팀이 만드는 과정을 함께 챙깁니다. 감각적인 아이디어를 좋아하지만, 일정과 기준 안에서 경험 품질을 지키는 쪽에 강합니다.",
      "imagePath": "/packages/product-assets/dpti/type/tceo.png",
      "shareImagePath": "/packages/product-assets/dpti/share/tceo.png",
      "strengthsKo": [
        "디자인 의도를 구현 디테일로 잘 옮겨요.",
        "팀과 사용자 사이의 맥락을 연결해요.",
        "작업 기준과 화면 품질을 꾸준히 관리해요."
      ],
      "watchoutsKo": [
        "경험 디테일에 집중하다 기술 부채 신호를 늦게 볼 수 있어요.",
        "팀 합의를 기다리며 개인 판단이 늦어질 수 있어요."
      ],
      "collaborationKo": "디자인 의도, 구현 제약, 우선순위를 한 화면에서 정리하면 팀의 합의 속도가 빨라져요.",
      "shareIntroKo": "UX 구현과 팀 합의를 같이 챙기는 제품 협업형이에요.",
      "abilities": {
        "ALG": 60,
        "LAN": 80,
        "PRB": 75,
        "TMW": 95,
        "COM": 90,
        "TMG": 80
      },
      "career": {
        "roles": [
          "프론트엔드 엔지니어",
          "UX 엔지니어",
          "디자인 시스템 엔지니어"
        ],
        "languages": [
          "TypeScript",
          "JavaScript",
          "HTML/CSS",
          "Kotlin"
        ],
        "skills": [
          "React",
          "디자인 시스템",
          "접근성",
          "상태 관리"
        ],
        "companyTypes": [
          "모바일/웹 제품 회사",
          "디자인 시스템이 있는 조직",
          "핀테크/커머스 제품팀"
        ]
      },
      "referenceMappings": {
        "mbti": {
          "codes": [
            "ENFJ",
            "INFJ"
          ],
          "confidence": "높음",
          "note": "사람의 경험을 중심에 두고 팀 합의와 실행 기준을 함께 잡는 점이 비슷해요.",
          "difference": "DPTI의 매핑은 사용자 경험과 협업 습관의 유사성을 보여주는 참고 정보예요."
        }
      },
      "vector": {
        "work": -1,
        "build": 1,
        "solve": -1,
        "manage": 1
      }
    },
    {
      "code": "TCEF",
      "titleKo": "팀 공감 기술자",
      "summaryKo": "팀의 감정선과 사용자의 불편을 읽고 유연하게 움직이는 타입.",
      "descriptionKo": "상황마다 필요한 대화와 조율을 찾아 팀의 마찰을 줄입니다. 새로운 아이디어도 사람의 맥락 안에서 다루며, 변화가 많은 프로젝트에서 완충 역할을 잘합니다.",
      "imagePath": "/packages/product-assets/dpti/type/tcef.png",
      "shareImagePath": "/packages/product-assets/dpti/share/tcef.png",
      "strengthsKo": [
        "팀원이 놓친 사용자 감정을 잘 포착해요.",
        "분위기가 흔들릴 때 대화를 부드럽게 이어요.",
        "요구 변화에 맞춰 구현 방향을 조정해요."
      ],
      "watchoutsKo": [
        "모두의 입장을 고려하다 본인의 판단 기준이 흐려질 수 있어요.",
        "조율 부담이 커지면 실제 구현 시간이 부족해질 수 있어요."
      ],
      "collaborationKo": "공감한 내용을 결정 기준과 액션 아이템으로 바꾸면, 팀 분위기뿐 아니라 실행력도 같이 좋아져요.",
      "shareIntroKo": "팀과 사용자의 맥락을 읽고 유연하게 연결하는 타입이에요.",
      "abilities": {
        "ALG": 65,
        "LAN": 75,
        "PRB": 80,
        "TMW": 95,
        "COM": 90,
        "TMG": 70
      },
      "career": {
        "roles": [
          "스크럼 마스터 성향 개발자",
          "프로덕트 엔지니어",
          "QA 엔지니어"
        ],
        "languages": [
          "TypeScript",
          "Python",
          "JavaScript",
          "Java"
        ],
        "skills": [
          "요구 조율",
          "사용자 피드백 분석",
          "팀 퍼실리테이션",
          "테스트 설계"
        ],
        "companyTypes": [
          "협업 밀도가 높은 제품팀",
          "애자일 조직",
          "사용자 운영과 가까운 서비스팀"
        ]
      },
      "referenceMappings": {
        "mbti": {
          "codes": [
            "ENFP",
            "ENFJ"
          ],
          "confidence": "높음",
          "note": "팀 분위기와 사용자 감정을 읽고 변화에 맞춰 움직이는 성향이 비슷해요.",
          "difference": "DPTI는 업무 상황의 조율 방식에 초점을 두므로 대인 성향 전체를 판단하지 않아요."
        }
      },
      "vector": {
        "work": -1,
        "build": 1,
        "solve": -1,
        "manage": -1
      }
    },
    {
      "code": "TPLO",
      "titleKo": "팀 실행 설계자",
      "summaryKo": "팀의 속도와 품질을 계획적으로 정리하는 실용형 리더.",
      "descriptionKo": "좋은 프로세스가 좋은 결과를 만든다고 믿습니다. 검증된 방식과 명확한 일정으로 팀의 낭비를 줄이고, 모두가 같은 목표를 향해 움직이게 합니다.",
      "imagePath": "/packages/product-assets/dpti/type/tplo.png",
      "shareImagePath": "/packages/product-assets/dpti/share/tplo.png",
      "strengthsKo": [
        "팀 작업을 우선순위와 일정으로 잘 정리해요.",
        "실용적인 개선으로 병목을 줄여요.",
        "마감과 품질 기준을 균형 있게 관리해요."
      ],
      "watchoutsKo": [
        "프로세스가 강해지면 탐색 시간이 부족해질 수 있어요.",
        "팀원이 속도 압박을 느끼지 않도록 여지를 남겨야 해요."
      ],
      "collaborationKo": "계획표뿐 아니라 왜 그 순서인지 설명하면, 팀의 실행력과 납득감이 같이 올라갑니다.",
      "shareIntroKo": "팀의 속도와 품질을 계획적으로 정리하는 타입이에요.",
      "abilities": {
        "ALG": 70,
        "LAN": 85,
        "PRB": 80,
        "TMW": 90,
        "COM": 80,
        "TMG": 95
      },
      "career": {
        "roles": [
          "개발 리드",
          "백엔드 엔지니어",
          "프로젝트 테크 리드"
        ],
        "languages": [
          "Java",
          "Go",
          "TypeScript",
          "SQL"
        ],
        "skills": [
          "프로젝트 관리",
          "CI/CD",
          "코드 리뷰",
          "운영 자동화"
        ],
        "companyTypes": [
          "스케일업 조직",
          "B2B SaaS",
          "운영 안정성이 중요한 플랫폼팀"
        ]
      },
      "referenceMappings": {
        "mbti": {
          "codes": [
            "ESTJ",
            "ENTJ"
          ],
          "confidence": "높음",
          "note": "팀의 실행 속도와 품질 기준을 명확히 잡고 밀어주는 점이 비슷해요.",
          "difference": "DPTI의 회사/팀 추천은 업무 환경 적합도 힌트이며, 성격 유형의 적성 판정은 아니에요."
        }
      },
      "vector": {
        "work": -1,
        "build": -1,
        "solve": 1,
        "manage": 1
      }
    },
    {
      "code": "TPLF",
      "titleKo": "협동적 버그 해결사",
      "summaryKo": "팀과 함께 현장의 문제를 빠르게 좁혀 해결하는 타입.",
      "descriptionKo": "문제가 터졌을 때 혼자 끌어안기보다 팀의 단서를 모아 빠르게 대응합니다. 계획에 묶이기보다 지금 필요한 조치를 찾고, 현실적인 해결로 흐름을 되살립니다.",
      "imagePath": "/packages/product-assets/dpti/type/tplf.png",
      "shareImagePath": "/packages/product-assets/dpti/share/tplf.png",
      "strengthsKo": [
        "장애 상황에서 팀의 단서를 빠르게 모아요.",
        "실용적인 우회책과 후속 조치를 구분해요.",
        "압박이 있는 상황에서도 협업 흐름을 유지해요."
      ],
      "watchoutsKo": [
        "빠른 대응 뒤에 정리와 회고가 빠질 수 있어요.",
        "여러 사람의 요청을 받다 우선순위가 흔들릴 수 있어요."
      ],
      "collaborationKo": "상황판, 담당자, 다음 확인 시점을 명확히 하면 협동적인 해결력이 더 안정적으로 발휘돼요.",
      "shareIntroKo": "팀과 단서를 모아 문제를 빠르게 해결하는 타입이에요.",
      "abilities": {
        "ALG": 80,
        "LAN": 75,
        "PRB": 90,
        "TMW": 85,
        "COM": 75,
        "TMG": 70
      },
      "career": {
        "roles": [
          "SRE",
          "QA 자동화 엔지니어",
          "백엔드 운영 엔지니어"
        ],
        "languages": [
          "Python",
          "Go",
          "Java",
          "Bash"
        ],
        "skills": [
          "모니터링",
          "장애 커뮤니케이션",
          "테스트 자동화",
          "런북 작성"
        ],
        "companyTypes": [
          "24/7 운영 서비스",
          "인프라팀",
          "품질과 안정성이 핵심인 회사"
        ]
      },
      "referenceMappings": {
        "mbti": {
          "codes": [
            "ESTP",
            "ISTP"
          ],
          "confidence": "보통",
          "note": "압박이 있는 상황에서 단서를 모아 빠르게 움직이는 실전형 감각이 비슷해요.",
          "difference": "DPTI는 장애 대응과 협업 방식에 대한 힌트라, 일상적 성향과는 다를 수 있어요."
        }
      },
      "vector": {
        "work": -1,
        "build": -1,
        "solve": 1,
        "manage": -1
      }
    },
    {
      "code": "TPEO",
      "titleKo": "제품 개선 조율가",
      "summaryKo": "팀 협업으로 사용자 문제를 현실적인 제품 개선으로 바꾸는 타입.",
      "descriptionKo": "사용자 불편을 놓치지 않으면서도 팀이 실제로 구현할 수 있는 범위를 찾습니다. 감정적인 맥락과 일정 관리를 함께 챙겨 제품 개선을 꾸준히 밀어줍니다.",
      "imagePath": "/packages/product-assets/dpti/type/tpeo.png",
      "shareImagePath": "/packages/product-assets/dpti/share/tpeo.png",
      "strengthsKo": [
        "사용자 문제를 팀 작업으로 잘 쪼개요.",
        "기획, 디자인, 개발 사이의 언어를 연결해요.",
        "일정 안에서 체감 품질을 높이는 선택을 해요."
      ],
      "watchoutsKo": [
        "사용자 요청을 많이 반영하다 제품 방향이 흐려질 수 있어요.",
        "팀 합의를 챙기느라 어려운 기술 판단을 늦출 수 있어요."
      ],
      "collaborationKo": "사용자 영향도, 구현 난이도, 일정 리스크를 같이 보여주면 팀이 더 빠르고 차분하게 결정할 수 있어요.",
      "shareIntroKo": "사용자 문제를 팀의 제품 개선으로 바꾸는 타입이에요.",
      "abilities": {
        "ALG": 70,
        "LAN": 75,
        "PRB": 80,
        "TMW": 85,
        "COM": 90,
        "TMG": 80
      },
      "career": {
        "roles": [
          "프로덕트 엔지니어",
          "프론트엔드 엔지니어",
          "PM 성향 개발자"
        ],
        "languages": [
          "TypeScript",
          "JavaScript",
          "Python",
          "SQL"
        ],
        "skills": [
          "제품 지표 분석",
          "A/B 테스트",
          "요구사항 쪼개기",
          "디자인 협업"
        ],
        "companyTypes": [
          "제품 중심 스타트업",
          "커머스/핀테크 서비스",
          "데이터 기반 제품팀"
        ]
      },
      "referenceMappings": {
        "mbti": {
          "codes": [
            "ESFJ",
            "ENFJ"
          ],
          "confidence": "보통",
          "note": "사용자 문제를 팀의 실행 계획으로 바꾸고 합의를 만드는 면이 비슷해요.",
          "difference": "DPTI의 조직성은 프로젝트 운영 방식에 대한 선호라 MBTI의 J와 일부만 겹쳐요."
        }
      },
      "vector": {
        "work": -1,
        "build": -1,
        "solve": -1,
        "manage": 1
      }
    },
    {
      "code": "TPEF",
      "titleKo": "현실적 변화 조율가",
      "summaryKo": "팀과 함께 현실적인 변화와 새로운 가능성을 연결하는 타입.",
      "descriptionKo": "협업을 통해 더 나은 아이디어가 나온다고 믿고, 변화하는 상황을 부담보다 기회로 봅니다. 사람의 맥락을 놓치지 않으면서 실용적인 개선을 만들어냅니다.",
      "imagePath": "/packages/product-assets/dpti/type/tpef.png",
      "shareImagePath": "/packages/product-assets/dpti/share/tpef.png",
      "strengthsKo": [
        "팀의 다양한 관점을 실행 가능한 변화로 묶어요.",
        "사용자와 동료의 피드백을 빠르게 흡수해요.",
        "현실적인 제약 안에서도 새 가능성을 찾아요."
      ],
      "watchoutsKo": [
        "변화에 열려 있다 보니 방향이 자주 흔들릴 수 있어요.",
        "모두의 의견을 반영하려다 핵심 기준이 약해질 수 있어요."
      ],
      "collaborationKo": "변경 제안마다 목표와 포기할 것을 함께 정하면, 현실적인 변화가 더 선명한 결과로 이어져요.",
      "shareIntroKo": "팀과 함께 현실적인 변화를 만드는 협력 변화형이에요.",
      "abilities": {
        "ALG": 75,
        "LAN": 85,
        "PRB": 80,
        "TMW": 95,
        "COM": 90,
        "TMG": 75
      },
      "career": {
        "roles": [
          "풀스택 엔지니어",
          "애자일 개발자",
          "솔루션 엔지니어"
        ],
        "languages": [
          "TypeScript",
          "Python",
          "Ruby",
          "JavaScript"
        ],
        "skills": [
          "빠른 실험",
          "우선순위 조정",
          "팀 커뮤니케이션",
          "서비스 운영"
        ],
        "companyTypes": [
          "변화가 빠른 스타트업",
          "크로스펑셔널 팀",
          "고객 피드백 루프가 짧은 회사"
        ]
      },
      "referenceMappings": {
        "mbti": {
          "codes": [
            "ENFP",
            "ESFP"
          ],
          "confidence": "보통",
          "note": "사람들의 피드백을 흡수하고 현실적인 변화로 연결하는 방식이 비슷해요.",
          "difference": "DPTI의 결과는 개발 팀 안에서의 행동 경향을 설명하는 참고용 연결고리예요."
        }
      },
      "vector": {
        "work": -1,
        "build": -1,
        "solve": -1,
        "manage": -1
      }
    }
  ]
};
