import { PRDetails } from '../../providers/types.js'

export interface ReviewPromptOptions {
  reviewType?: 'comprehensive' | 'focused' | 'security'
  additionalContext?: string
}

export function buildReviewPrompt(
  prData: PRDetails & { diff: string },
  options: ReviewPromptOptions = {},
  providerName: string,
): string {
  const { additionalContext, reviewType = 'comprehensive' } = options

  const basePrompt = `請分析以下 Pull Request 並提供代碼審查：

## PR 資訊
- Repository: ${prData.owner}/${prData.repo}
- PR #${prData.number}: ${prData.title}
- URL: ${prData.url}
- Target branch: ${prData.baseBranch}
- Source branch: ${prData.headBranch}

## 代碼變更
\`\`\`diff
${prData.diff}
\`\`\``

  let analysisInstructions = ''

  switch (reviewType) {
    case 'security':
      analysisInstructions = `
請專注於安全性分析：
- 潛在的安全漏洞
- 輸入驗證問題
- 權限控制檢查
- 敏感資料處理`
      break
    case 'focused':
      analysisInstructions = `
請提供重點摘要審查：
- 主要變更概述
- 潛在問題識別
- 關鍵建議`
      break
    default:
      analysisInstructions = `
請分析以下方面：
- 代碼品質和最佳實踐
- 潛在的 bug 或問題
- 效能考量
- 代碼一致性和風格
- 測試覆蓋率`
  }

  const reviewStructure = `

請按以下格式提供結構化審查：

## 📋 變更摘要
[簡述主要變更內容]

## ✅ 優點
[指出好的實踐和改進]

## ⚠️ 建議改進
[具體的改進建議]

## 🐛 潛在問題
[如有發現問題，請列出]

## 總體評估
[批准/請求變更/僅評論]

請按以下步驟執行審查：
1. 分析提供的代碼變更
2. 根據上述格式生成審查內容
3. 將審查內容發布為 PR/MR 評論

注意：使用適當的 ${providerName} CLI 指令來發布評論。`

  let finalPrompt = basePrompt + analysisInstructions + reviewStructure

  if (additionalContext) {
    finalPrompt += `\n\n## 額外上下文\n${additionalContext}\n\n請將此上下文納入審查考量。`
  }

  return finalPrompt
}
