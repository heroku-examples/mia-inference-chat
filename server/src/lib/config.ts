interface Config {
  models: {
    [key: string]: {
      INFERENCE_URL: string;
      API_KEY: string;
    };
  };
  tools: {
    [key: string]: {
      type: string;
      function: {
        name: string;
      };
      runtime_params?: {
        target_app_name?: string;
      };
    };
  };
}

export const config: Config = {
  models: {
    'claude-3-5-sonnet-latest': {
      INFERENCE_URL: process.env.INFERENCE_3_5_URL || 'https://localhost:3000/v1/chat',
      API_KEY: process.env.INFERENCE_3_5_KEY || 'inf-1234567890',
    },
    'claude-3-7-sonnet': {
      INFERENCE_URL: process.env.INFERENCE_3_7_URL || 'https://localhost:3000/v1/chat',
      API_KEY: process.env.INFERENCE_3_7_KEY || 'inf-1234567890',
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
      },
    },
    code_exec_ruby: {
      type: 'heroku_tool',
      function: {
        name: 'code_exec_ruby',
      },
      runtime_params: {
        target_app_name: process.env.RUBY_RUNNER || 'mia-demo-ruby-runner',
      },
    },
    code_exec_node: {
      type: 'heroku_tool',
      function: {
        name: 'code_exec_node',
      },
      runtime_params: {
        target_app_name: process.env.NODE_RUNNER || 'mia-demo-node-runner',
      },
    },
    code_exec_go: {
      type: 'heroku_tool',
      function: {
        name: 'code_exec_go',
      },
      runtime_params: {
        target_app_name: process.env.GO_RUNNER || 'mia-demo-go-runner',
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
