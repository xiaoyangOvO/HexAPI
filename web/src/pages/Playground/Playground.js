import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { UserContext } from '../../context/User/index.js';
import { API, getUserIdFromLocalStorage, showError } from '../../helpers/index.js';
import { Card, Chat, Input, Layout, Select, Slider, TextArea, Typography, Button, Highlight } from '@douyinfe/semi-ui';
import { SSE } from 'sse';
import { IconSetting } from '@douyinfe/semi-icons';
import { StyleContext } from '../../context/Style/index.js';
import { useTranslation } from 'react-i18next';
import { renderGroupOption } from '../../helpers/render.js';

const roleInfo = {
  user: {
    name: 'User',
    avatar: 'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/docs-icon.png'
  },
  assistant: {
    name: 'Assistant',
    avatar: 'logo.png'
  },
  system: {
    name: 'System',
    avatar: 'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/other/logo.png'
  }
}

// 样式常量
const styles = {
  layout: {
    height: '100%',
    backgroundColor: 'var(--semi-color-bg-0)',
  },
  sider: {
    backgroundColor: 'transparent',
    padding: '16px 0',
  },
  settingsCard: {
    border: '1px solid var(--semi-color-border)',
    borderRadius: '16px',
    margin: '0 16px',
    transition: 'all 0.3s',
  },
  settingSection: {
    marginBottom: '24px',
  },
  settingLabel: {
    marginBottom: '8px',
    fontSize: '14px',
    fontWeight: 600,
  },
  chatContainer: {
    height: '100%',
    position: 'relative',
    padding: '16px',
  },
  chatWrapper: {
    height: '100%',
    border: '1px solid var(--semi-color-border)',
    borderRadius: '16px',
    backgroundColor: 'var(--semi-color-bg-1)',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
  },
  toggleButton: {
    position: 'absolute',
    left: ({ showSettings }) => showSettings ? -10 : -20,
    top: '50%',
    transform: 'translateY(-50%)',
    zIndex: 1000,
    width: 40,
    height: 40,
    borderRadius: '0 20px 20px 0',
    padding: 0,
    boxShadow: '2px 0 8px rgba(0, 0, 0, 0.15)',
  },
  inputArea: {
    margin: '8px 16px',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderRadius: '16px',
    padding: '12px',
    border: '1px solid var(--semi-color-border)',
    backgroundColor: 'var(--semi-color-bg-2)',
  }
};

let messageId = 4;
const getId = () => `${messageId++}`;

const Playground = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [userState] = useContext(UserContext);
  const [styleState] = useContext(StyleContext);
  const [showSettings, setShowSettings] = useState(!styleState.isMobile);
  
  const defaultMessage = [
    {
      role: 'user',
      id: '2',
      createAt: 1715676751919,
      content: t('你好'),
    },
    {
      role: 'assistant',
      id: '3',
      createAt: 1715676751919,
      content: t('你好，请问有什么可以帮助您的吗？'),
    }
  ];

  const [inputs, setInputs] = useState({
    model: 'gpt-4o-mini',
    group: '',
    max_tokens: 0,
    temperature: 0,
  });
  const [status, setStatus] = useState({});
  const [systemPrompt, setSystemPrompt] = useState('You are a helpful assistant. You can help me by answering my questions. You can also ask me questions.');
  const [message, setMessage] = useState(defaultMessage);
  const [models, setModels] = useState([]);
  const [groups, setGroups] = useState([]);

  const handleInputChange = (name, value) => {
    setInputs((inputs) => ({ ...inputs, [name]: value }));
  };

  useEffect(() => {
    if (searchParams.get('expired')) {
      showError(t('未登录或登录已过期，请重新登录！'));
    }
    let status = localStorage.getItem('status');
    if (status) {
      status = JSON.parse(status);
      setStatus(status);
    }
    loadModels();
    loadGroups();
  }, []);

  const loadModels = async () => {
    let res = await API.get(`/api/user/models`);
    const { success, message, data } = res.data;
    if (success) {
      let localModelOptions = data.map((model) => ({
        label: model,
        value: model,
      }));
      setModels(localModelOptions);
    } else {
      showError(t(message));
    }
  };

  const loadGroups = async () => {
    let res = await API.get(`/api/user/self/groups`);
    const { success, message, data } = res.data;
    if (success) {
      let localGroupOptions = Object.entries(data).map(([group, info]) => ({
        label: info.desc,
        value: group,
        ratio: info.ratio
      }));

      if (localGroupOptions.length === 0) {
        localGroupOptions = [{
          label: t('用户分组'),
          value: '',
          ratio: 1
        }];
      } else {
        const localUser = JSON.parse(localStorage.getItem('user'));
        const userGroup = (userState.user && userState.user.group) || (localUser && localUser.group);
        
        if (userGroup) {
          const userGroupIndex = localGroupOptions.findIndex(g => g.value === userGroup);
          if (userGroupIndex > -1) {
            const userGroupOption = localGroupOptions.splice(userGroupIndex, 1)[0];
            localGroupOptions.unshift(userGroupOption);
          }
        }
      }

      setGroups(localGroupOptions);
      handleInputChange('group', localGroupOptions[0].value);
    } else {
      showError(t(message));
    }
  };

  const getSystemMessage = () => {
    if (systemPrompt !== '') {
      return {
        role: 'system',
        id: '1',
        createAt: 1715676751919,
        content: systemPrompt,
      }
    }
  }

  let handleSSE = (payload) => {
    let source = new SSE('/pg/chat/completions', {
      headers: {
        "Content-Type": "application/json",
        "New-Api-User": getUserIdFromLocalStorage(),
      },
      method: "POST",
      payload: JSON.stringify(payload),
    });
    source.addEventListener("message", (e) => {
      if (e.data !== "[DONE]") {
        let payload = JSON.parse(e.data);
        // console.log("Payload: ", payload);
        if (payload.choices.length === 0) {
          source.close();
          completeMessage();
        } else {
          let text = payload.choices[0].delta.content;
          if (text) {
            generateMockResponse(text);
          }
        }
      } else {
        completeMessage();
      }
    });

    source.addEventListener("error", (e) => {
      generateMockResponse(e.data)
      completeMessage('error')
    });

    source.addEventListener("readystatechange", (e) => {
      if (e.readyState >= 2) {
        if (source.status === undefined) {
          source.close();
          completeMessage();
        }
      }
    });
    source.stream();
  }

  const onMessageSend = useCallback((content, attachment) => {
    console.log("attachment: ", attachment);
    setMessage((prevMessage) => {
      const newMessage = [
        ...prevMessage,
        {
          role: 'user',
          content: content,
          createAt: Date.now(),
          id: getId()
        }
      ];

      // 将 getPayload 移到这里
      const getPayload = () => {
        let systemMessage = getSystemMessage();
        let messages = newMessage.map((item) => {
          return {
            role: item.role,
            content: item.content,
          }
        });
        if (systemMessage) {
          messages.unshift(systemMessage);
        }
        return {
          messages: messages,
          stream: true,
          model: inputs.model,
          group: inputs.group,
          max_tokens: parseInt(inputs.max_tokens),
          temperature: inputs.temperature,
        };
      };

      // 使用更新后的消息状态调用 handleSSE
      handleSSE(getPayload());
      newMessage.push({
        role: 'assistant',
        content: '',
        createAt: Date.now(),
        id: getId(),
        status: 'loading'
      });
      return newMessage;
    });
  }, [getSystemMessage]);

  const completeMessage = useCallback((status = 'complete') => {
    // console.log("Complete Message: ", status)
    setMessage((prevMessage) => {
      const lastMessage = prevMessage[prevMessage.length - 1];
      // only change the status if the last message is not complete and not error
      if (lastMessage.status === 'complete' || lastMessage.status === 'error') {
        return prevMessage;
      }
      return [
        ...prevMessage.slice(0, -1),
        { ...lastMessage, status: status }
      ];
    });
  }, [])

  const generateMockResponse = useCallback((content) => {
    // console.log("Generate Mock Response: ", content);
    setMessage((message) => {
      const lastMessage = message[message.length - 1];
      let newMessage = {...lastMessage};
      if (lastMessage.status === 'loading' || lastMessage.status === 'incomplete') {
        newMessage = {
          ...newMessage,
          content: (lastMessage.content || '') + content,
          status: 'incomplete'
        }
      }
      return [ ...message.slice(0, -1), newMessage ]
    })
  }, []);

  // 设置面板组件
  const SettingsPanel = () => {
    return (
      <Card style={styles.settingsCard}>
        <div style={styles.settingSection}>
          <Typography.Text strong style={styles.settingLabel}>{t('分组')}</Typography.Text>
          <Select
            placeholder={t('请选择分组')}
            value={inputs.group}
            onChange={(value) => handleInputChange('group', value)}
            style={{ width: '100%' }}
            optionList={groups}
            renderOptionItem={renderGroupOption}
          />
        </div>

        <div style={styles.settingSection}>
          <Typography.Text strong style={styles.settingLabel}>{t('模型')}</Typography.Text>
          <Select
            placeholder={t('请选择模型')}
            value={inputs.model}
            onChange={(value) => handleInputChange('model', value)}
            style={{ width: '100%' }}
            optionList={models}
            filter
          />
        </div>

        <div style={styles.settingSection}>
          <Typography.Text strong style={styles.settingLabel}>Temperature</Typography.Text>
          <Slider
            step={0.1}
            min={0.1}
            max={1}
            value={inputs.temperature}
            onChange={(value) => handleInputChange('temperature', value)}
          />
        </div>

        <div style={styles.settingSection}>
          <Typography.Text strong style={styles.settingLabel}>MaxTokens</Typography.Text>
          <Input
            placeholder='MaxTokens'
            value={inputs.max_tokens}
            onChange={(value) => handleInputChange('max_tokens', value)}
          />
        </div>

        <div style={styles.settingSection}>
          <Typography.Text strong style={styles.settingLabel}>System Prompt</Typography.Text>
          <TextArea
            placeholder='System Prompt'
            defaultValue={systemPrompt}
            onChange={setSystemPrompt}
            autosize
          />
        </div>
      </Card>
    );
  };

  // 设置切换按钮
  const SettingsToggle = () => {
    if (!styleState.isMobile) return null;
    return (
      <Button
        icon={<IconSetting />}
        style={styles.toggleButton({ showSettings })}
        onClick={() => setShowSettings(!showSettings)}
        theme="solid"
        type="primary"
      />
    );
  };

  // 自定义输入区域渲染
  const CustomInputRender = ({ detailProps }) => {
    const { inputNode, sendNode, onClick } = detailProps;
    return (
      <div style={styles.inputArea} onClick={onClick}>
        {inputNode}
        {sendNode}
      </div>
    );
  };

  return (
    <Layout style={styles.layout}>
      {(showSettings || !styleState.isMobile) && (
        <Layout.Sider style={styles.sider}>
          <SettingsPanel />
        </Layout.Sider>
      )}
      <Layout.Content>
        <div style={styles.chatContainer}>
          <SettingsToggle />
          <div style={styles.chatWrapper}>
            <Chat
              chatBoxRenderConfig={{
                renderChatBoxAction: () => null
              }}
              renderInputArea={useCallback((props) => <CustomInputRender {...props} />, [])}
              roleConfig={roleInfo}
              chats={message}
              onMessageSend={onMessageSend}
              showClearContext
              onClear={() => setMessage([])}
            />
          </div>
        </div>
      </Layout.Content>
    </Layout>
  );
};

export default Playground;
