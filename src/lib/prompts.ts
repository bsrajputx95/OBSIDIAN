export type Stage = "research" | "reasoning" | "coding" | "final";
export type Worker = "worker1" | "worker2" | "worker3" | "master";

export function getStagePrompt(
  stage: Stage,
  worker: Worker,
  userPrompt: string,
  options?: { workerOutputs?: string[]; previousStageContext?: string }
): string {
  let basePrompt = `You are an AI assistant working in a multi-model orchestration system. The user's original request is: "${userPrompt}"

You are currently in the ${stage.toUpperCase()} stage, working as ${worker.toUpperCase()}.

`;

  if (options?.previousStageContext) {
    basePrompt = `Context from previous stage:
${options.previousStageContext}

` + basePrompt;
  }

  let prompt = basePrompt;
  switch (stage) {
    case "research":
      prompt = getResearchPrompt(worker, basePrompt);
      break;
    case "reasoning":
      prompt = getReasoningPrompt(worker, basePrompt);
      break;
    case "coding":
      prompt = getCodingPrompt(worker, basePrompt);
      break;
    case "final":
      prompt = getFinalPrompt(worker, basePrompt);
      break;
    default:
      prompt = basePrompt + "Please provide a comprehensive analysis.";
  }

  if (worker === "master") {
    prompt = appendWorkerOutputs(prompt, worker, options?.workerOutputs);
  }

  return prompt;
}

function appendWorkerOutputs(prompt: string, worker: Worker, workerOutputs?: string[]): string {
  if (worker === "master" && workerOutputs && workerOutputs.length > 0) {
    return (
      prompt +
      `\nHere are the outputs from the 3 specialist workers that you must synthesize:

=== WORKER 1 OUTPUT ===
${workerOutputs[0] || ""}

=== WORKER 2 OUTPUT ===
${workerOutputs[1] || ""}

=== WORKER 3 OUTPUT ===
${workerOutputs[2] || ""}`
    );
  }
  return prompt;
}

function getResearchPrompt(worker: Worker, basePrompt: string): string {
  switch (worker) {
    case "worker1":
      return basePrompt + `Your role is MARKET ANALYSIS SPECIALIST. Focus on:
- Identify existing solutions and competitors in this domain
- Analyze market landscape and current offerings
- Research pricing models, user adoption, and market gaps
- Find real data, statistics, and case studies
- Provide specific examples and references

Provide a detailed market analysis with concrete data and examples.`;

    case "worker2":
      return basePrompt + `Your role is TECHNICAL RESEARCH SPECIALIST. Focus on:
- Research technical stack requirements and best practices
- Analyze architecture patterns and implementation approaches
- Investigate technology trends and emerging solutions
- Research performance benchmarks and scalability considerations
- Find technical documentation, tutorials, and resources

Provide comprehensive technical research with specific technologies and approaches.`;

    case "worker3":
      return basePrompt + `Your role is PROBLEM VALIDATION SPECIALIST. Focus on:
- Validate the problem statement and user needs
- Identify edge cases, failure modes, and potential issues
- Research user pain points and requirements
- Analyze risk factors and mitigation strategies
- Investigate similar projects and their challenges

Provide thorough problem validation with specific risks and requirements.`;

    case "master":
      return basePrompt + `Your role is RESEARCH SYNTHESIS MASTER. Your task:
- Combine and synthesize ALL findings from the 3 worker models
- Organize information into a comprehensive research report
- Maintain ALL original content while improving structure
- Create actionable insights and recommendations
- Prepare foundation for the reasoning stage

Synthesize all research findings into a comprehensive, well-organized report.`;

    default:
      return basePrompt;
  }
}

function getReasoningPrompt(worker: Worker, basePrompt: string): string {
  switch (worker) {
    case "worker1":
      return basePrompt + `Your role is SOLUTION ARCHITECT. Focus on:
- Decompose the problem into logical components
- Design solution architecture and system structure
- Plan implementation approach and methodology
- Define technical requirements and constraints
- Create logical frameworks and decision trees

Provide detailed solution architecture and implementation approach.`;

    case "worker2":
      return basePrompt + `Your role is RISK & OPTIMIZATION ANALYST. Focus on:
- Analyze potential risks and mitigation strategies
- Evaluate trade-offs and decision frameworks
- Identify optimization opportunities and performance considerations
- Assess scalability and maintainability factors
- Create risk assessment matrices and decision criteria

Provide comprehensive risk analysis and optimization strategies.`;

    case "worker3":
      return basePrompt + `Your role is IMPLEMENTATION PLANNER. Focus on:
- Create detailed implementation timeline and milestones
- Plan resource allocation and team requirements
- Define testing strategies and quality assurance
- Plan deployment and rollout strategies
- Create project management frameworks

Provide detailed implementation planning and project management approach.`;

    case "master":
      return basePrompt + `Your role is REASONING SYNTHESIS MASTER. Your task:
- Combine and synthesize ALL reasoning from the 3 worker models
- Create a unified strategic plan and approach
- Maintain ALL original content while improving organization
- Develop clear decision frameworks and next steps
- Prepare foundation for the coding stage

Synthesize all reasoning into a comprehensive strategic plan.`;

    default:
      return basePrompt;
  }
}

function getCodingPrompt(worker: Worker, basePrompt: string): string {
  switch (worker) {
    case "worker1":
      return basePrompt + `Your role is SYSTEM ARCHITECT. Focus on:
- Design file structure, database schemas, and API endpoints
- Create system architecture and data flow diagrams
- Define core components and their interactions
- Plan infrastructure and deployment architecture
- Specify technical specifications and requirements

Provide detailed system architecture with specific technical implementations.`;

    case "worker2":
      return basePrompt + `Your role is FRONTEND & UX DEVELOPER. Focus on:
- Design component architecture and state management
- Plan user interface and user experience flows
- Create responsive design and accessibility considerations
- Define frontend frameworks and libraries
- Plan client-side architecture and optimization

Provide comprehensive frontend architecture and implementation details.`;

    case "worker3":
      return basePrompt + `Your role is SECURITY & DEVOPS SPECIALIST. Focus on:
- Implement security measures and best practices
- Plan testing strategies and quality assurance
- Design deployment and monitoring systems
- Create documentation and maintenance procedures
- Plan scalability and performance optimization

Provide detailed security, testing, and deployment implementation.`;

    case "master":
      return basePrompt + `Your role is CODING SYNTHESIS MASTER. Your task:
- Combine and synthesize ALL technical implementations from the 3 worker models
- Create a comprehensive technical implementation guide
- Maintain ALL original content while improving organization
- Provide complete code examples and implementation details
- Prepare foundation for the final stage

Synthesize all technical implementations into a complete development guide.`;

    default:
      return basePrompt;
  }
}

function getFinalPrompt(worker: Worker, basePrompt: string): string {
  switch (worker) {
    case "worker1":
      return basePrompt + `Your role is RESEARCH CONSOLIDATOR. Focus on:
- Consolidate all research findings from previous stages
- Ensure comprehensive market and technical research coverage
- Validate research completeness and accuracy
- Prepare research summary for final synthesis

Provide a comprehensive research consolidation.`;

    case "worker2":
      return basePrompt + `Your role is REASONING CONSOLIDATOR. Focus on:
- Consolidate all reasoning and strategic planning from previous stages
- Ensure comprehensive solution architecture coverage
- Validate reasoning completeness and logical flow
- Prepare reasoning summary for final synthesis

Provide a comprehensive reasoning consolidation.`;

    case "worker3":
      return basePrompt + `Your role is IMPLEMENTATION CONSOLIDATOR. Focus on:
- Consolidate all technical implementations from previous stages
- Ensure comprehensive coding and architecture coverage
- Validate implementation completeness and feasibility
- Prepare implementation summary for final synthesis

Provide a comprehensive implementation consolidation.`;

    case "master":
      return basePrompt + `Your role is FINAL SYNTHESIS MASTER. Your ultimate task:
- Consolidate ALL outputs from research, reasoning, and coding stages
- Create the most comprehensive, actionable final deliverable
- Maintain ALL original content while perfecting organization
- Provide complete implementation roadmap and next steps
- Deliver production-ready comprehensive guide

Create the ultimate comprehensive synthesis that combines everything into an actionable final deliverable.`;

    default:
      return basePrompt;
  }
}

