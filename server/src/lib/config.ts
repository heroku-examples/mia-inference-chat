import { ModelConfig } from '../types/shared.js';

interface Config {
  system_prompt: string;
  models: {
    [key: string]: ModelConfig;
  };
  tools: {
    [key: string]: {
      type: string;
      function: {
        name: string;
      };
      runtime_params?: {
        target_app_name?: string;
        max_retries?: number;
      };
    };
  };
}

export const config: Config = {
  system_prompt:
    process.env.SYSTEM_PROMPT ||
    'You are a helpful assistant that can answer questions and help with tasks.',
  models: {
    'claude-3-5-sonnet-latest': {
      INFERENCE_URL: process.env.INFERENCE_3_5_URL || 'https://us.inference.heroku.com',
      API_KEY: process.env.INFERENCE_3_5_KEY || 'inf-1234567890',
    },
    'claude-3-7-sonnet': {
      INFERENCE_URL: process.env.INFERENCE_3_7_URL || 'https://us.inference.heroku.com',
      API_KEY: process.env.INFERENCE_3_7_KEY || 'inf-1234567890',
    },
    'stable-image-ultra': {
      DIFFUSION_URL: process.env.DIFFUSION_URL || 'https://us.inference.heroku.com',
      API_KEY: process.env.DIFFUSION_KEY || 'inf-1234567890',
    },
  },
  tools: {
    web_search: {
      type: 'heroku_tool',
      function: {
        name: 'search_web',
      },
    },
    web_browsing: {
      type: 'heroku_tool',
      function: {
        name: 'web_browsing_multi_page',
      },
    },
    code_exec_python: {
      type: 'heroku_tool',
      function: {
        name: 'code_exec_python',
      },
      runtime_params: {
        target_app_name: process.env.PYTHON_RUNNER || 'mia-demo-python-runner',
        max_retries: +(process.env.RUNNER_MAX_RETRIES || 5),
      },
    },
    code_exec_ruby: {
      type: 'heroku_tool',
      function: {
        name: 'code_exec_ruby',
      },
      runtime_params: {
        target_app_name: process.env.RUBY_RUNNER || 'mia-demo-ruby-runner',
        max_retries: +(process.env.RUNNER_MAX_RETRIES || 5),
      },
    },
    code_exec_node: {
      type: 'heroku_tool',
      function: {
        name: 'code_exec_node',
      },
      runtime_params: {
        target_app_name: process.env.NODE_RUNNER || 'mia-demo-node-runner',
        max_retries: +(process.env.RUNNER_MAX_RETRIES || 5),
      },
    },
    code_exec_go: {
      type: 'heroku_tool',
      function: {
        name: 'code_exec_go',
      },
      runtime_params: {
        target_app_name: process.env.GO_RUNNER || 'mia-demo-go-runner',
        max_retries: +(process.env.RUNNER_MAX_RETRIES || 5),
      },
    },
  },
};

export const getModels = () => {
  return Object.keys(config.models);
};

export const getTool = (tool: string) => {
  return config.tools[tool];
};

export const getModel = (model: string) => {
  return config.models[model];
};
