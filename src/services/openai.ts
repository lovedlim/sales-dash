import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // 클라이언트 사이드에서 사용하기 위해 필요
});

export interface MeetingSummaryResult {
  summary: string;
  actionItems: string[];
  client?: string;
  assignee?: string;
  stage?: string;
}

export async function summarizeMeeting(
  content: string,
  client: string,
  assignee: string
): Promise<MeetingSummaryResult> {
  try {
    const prompt = `
다음은 ${client}와의 회의 내용입니다. 담당자는 ${assignee}입니다.

회의 내용:
${content}

위 회의 내용을 바탕으로 다음 형식으로 요약해주세요:

1. 요약: 회의의 핵심 내용을 2-3문장으로 간결하게 요약
2. 액션 아이템: 구체적인 실행 항목들을 3-5개 리스트로 작성
3. 영업 단계: 다음 중 정확히 하나를 선택 (lead, consultation, proposal, contract, completed)
   - lead: 리드발굴 (초기 접촉, 관심 표명, 첫 미팅)
   - consultation: 상담진행 (니즈 파악, 상세 논의, 요구사항 분석)
   - proposal: 제안요청 (견적서, 제안서 요청, 데모 진행)
   - contract: 계약진행 (계약 협상, 최종 검토, 결정 단계)
   - completed: 완료/보류 (계약 완료 또는 프로젝트 보류)

**중요**: stage 필드에는 반드시 위의 5개 값 중 하나만 사용하세요 (lead, consultation, proposal, contract, completed)

응답은 반드시 다음 JSON 형식으로 해주세요:
{
  "summary": "요약 내용",
  "actionItems": ["액션 아이템 1", "액션 아이템 2", "액션 아이템 3"],
  "stage": "lead"
}
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "당신은 영업 회의 내용을 분석하고 요약하는 전문가입니다. 항상 정확한 JSON 형식으로 응답하고, stage 필드에는 반드시 lead, consultation, proposal, contract, completed 중 하나만 사용하세요."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3, // 더 일관된 결과를 위해 낮춤
      max_tokens: 1000
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('OpenAI API 응답이 없습니다.');
    }

    console.log('OpenAI 원본 응답:', response);

    // JSON 파싱 시도
    try {
      const result = JSON.parse(response);
      
      // stage 값 검증 및 정규화
      const validStages = ['lead', 'consultation', 'proposal', 'contract', 'completed'];
      let normalizedStage = 'lead'; // 기본값
      
      if (result.stage && typeof result.stage === 'string') {
        const stageValue = result.stage.toLowerCase().trim();
        if (validStages.includes(stageValue)) {
          normalizedStage = stageValue;
        } else {
          // 유사한 단어들을 매핑
          const stageMapping: Record<string, string> = {
            '리드': 'lead',
            '리드발굴': 'lead',
            '초기': 'lead',
            '상담': 'consultation',
            '상담진행': 'consultation',
            '컨설팅': 'consultation',
            '제안': 'proposal',
            '제안요청': 'proposal',
            '견적': 'proposal',
            '계약': 'contract',
            '계약진행': 'contract',
            '협상': 'contract',
            '완료': 'completed',
            '보류': 'completed',
            '종료': 'completed'
          };
          
          normalizedStage = stageMapping[stageValue] || 'lead';
        }
      }
      
      console.log('AI 분석 결과 - 원본 stage:', result.stage, '정규화된 stage:', normalizedStage);
      
      return {
        summary: result.summary || '요약을 생성할 수 없습니다.',
        actionItems: Array.isArray(result.actionItems) ? result.actionItems : [],
        stage: normalizedStage
      };
    } catch (parseError) {
      // JSON 파싱 실패 시 텍스트에서 정보 추출 시도
      console.warn('JSON 파싱 실패, 텍스트 파싱 시도:', parseError);
      
      return {
        summary: response.includes('요약:') 
          ? response.split('요약:')[1]?.split('\n')[0]?.trim() || '요약을 생성할 수 없습니다.'
          : '요약을 생성할 수 없습니다.',
        actionItems: extractActionItems(response),
        stage: extractStage(response)
      };
    }

  } catch (error) {
    console.error('OpenAI API 호출 오류:', error);
    
    // API 키 관련 오류 체크
    if (error instanceof Error && error.message.includes('API key')) {
      throw new Error('OpenAI API 키가 올바르지 않습니다. .env 파일의 VITE_OPENAI_API_KEY를 확인해주세요.');
    }
    
    throw new Error('회의 내용 요약 중 오류가 발생했습니다. 다시 시도해주세요.');
  }
}

function extractActionItems(text: string): string[] {
  const actionItemsSection = text.split('액션 아이템:')[1];
  if (!actionItemsSection) return [];
  
  const items = actionItemsSection
    .split('\n')
    .filter(line => line.trim().startsWith('-') || line.trim().startsWith('•') || /^\d+\./.test(line.trim()))
    .map(line => line.replace(/^[-•\d.]\s*/, '').trim())
    .filter(item => item.length > 0);
    
  return items.slice(0, 5); // 최대 5개까지
}

function extractStage(text: string): string {
  const stageKeywords = {
    lead: ['리드', '초기', '관심', '발굴', '첫', '처음'],
    consultation: ['상담', '니즈', '논의', '미팅', '분석', '요구사항'],
    proposal: ['제안', '견적', '데모', '요청', '프레젠테이션'],
    contract: ['계약', '협상', '검토', '체결', '결정', '승인'],
    completed: ['완료', '보류', '종료', '성사', '마무리']
  };
  
  const lowerText = text.toLowerCase();
  
  // 키워드 매칭으로 단계 결정
  for (const [stage, keywords] of Object.entries(stageKeywords)) {
    if (keywords.some(keyword => lowerText.includes(keyword))) {
      return stage;
    }
  }
  
  return 'lead'; // 기본값
}

// API 키 유효성 검사
export function validateApiKey(): boolean {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  return !!(apiKey && apiKey.startsWith('sk-') && apiKey.length > 20);
}