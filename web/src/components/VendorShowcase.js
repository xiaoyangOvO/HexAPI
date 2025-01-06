import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Typography, Spin } from '@douyinfe/semi-ui';
import './VendorShowcase.css';

const { Text } = Typography;

// 将供应商列表移到单独的配置文件是更好的实践
const vendorsList = [
  { name: 'OpenAI', icon: 'openai.svg', description: '开创性的AI研究机构' },
  { name: 'Azure OpenAI', icon: 'azure-color.svg', description: '企业级AI服务' },
  { name: 'Google Gemini', icon: 'gemini-color.svg', description: '下一代AI模型' },
  { name: '文心一言', icon: 'wenxin-color.svg', description: '百度智能对话模型' },
  { name: '通义千问', icon: 'qwen-color.svg', description: '阿里智能助手' },
  { name: '讯飞星火', icon: 'spark-color.svg', description: '科大讯飞AI平台' },
  { name: 'Moonshot', icon: 'moonshot.svg', description: '开源AI助手' },
  { name: '百川', icon: 'baichuan-color.svg', description: '开源大语言模型' },
  { name: 'Minimax', icon: 'minimax-color.svg', description: 'AI开放平台' },
  { name: '零一万物', icon: 'yi-color.svg', description: '智能对话引擎' },
  { name: 'Ollama', icon: 'ollama.svg', description: '本地AI助手' },
  { name: 'DeepSeek', icon: 'deepseek-color.svg', description: '深度学习模型' },
  { name: 'Claude', icon: 'claude-color.svg', description: 'Anthropic AI助手' },
  { name: 'ChatGLM', icon: 'chatglm-color.svg', description: '智能语言模型' },
  { name: 'Hunyuan', icon: 'hunyuan-color.svg', description: '腾讯混元助手' }
];

const VENDORS_PER_ROW = 5;
const ANIMATION_DELAY_BASE = 0.1;

const VendorItem = React.memo(({ vendor, index, rowIndex, totalInRow }) => {
  const animationDelay = `${(index + rowIndex * totalInRow) * ANIMATION_DELAY_BASE}s`;
  
  return (
    <div 
      className="vendor-item" 
      style={{ animationDelay }}
    >
      <div className="vendor-icon">
        <img 
          src={`/src/img/vendors/${vendor.icon}`}
          alt={vendor.name}
          loading="lazy"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = '/src/img/vendors/default-vendor.svg';
          }}
        />
      </div>
      <Text strong className="vendor-name">{vendor.name}</Text>
      <Text type="secondary" className="vendor-description">{vendor.description}</Text>
    </div>
  );
});

const VendorRow = React.memo(({ vendors, rowIndex }) => {
  // 确保每行有足够的项目以实现无缝滚动
  const normalizedVendors = useMemo(() => {
    const minRequired = Math.ceil(window.innerWidth / 170); // 170px = item width + gap
    let items = [...vendors];
    while (items.length < minRequired) {
      items = [...items, ...vendors];
    }
    return items;
  }, [vendors]);

  return (
    <div className={`vendor-row ${rowIndex % 2 === 1 ? 'reverse' : ''}`}>
      <div className="vendor-row-wrapper">
        <div className="vendor-row-content">
          {normalizedVendors.map((vendor, index) => (
            <VendorItem
              key={`${vendor.name}-${index}`}
              vendor={vendor}
              index={index}
              rowIndex={rowIndex}
              totalInRow={normalizedVendors.length}
            />
          ))}
        </div>
        <div className="vendor-row-content">
          {normalizedVendors.map((vendor, index) => (
            <VendorItem
              key={`${vendor.name}-${index}-clone`}
              vendor={vendor}
              index={index}
              rowIndex={rowIndex}
              totalInRow={normalizedVendors.length}
            />
          ))}
        </div>
      </div>
    </div>
  );
});

const VendorShowcase = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const validateVendors = useCallback(async () => {
    try {
      setLoading(true);
      setVendors(vendorsList);
    } catch (err) {
      setError('加载供应商数据时出错');
      console.error('Error loading vendors:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    validateVendors();
  }, [validateVendors]);

  const vendorRows = useMemo(() => {
    const rows = [];
    for (let i = 0; i < vendors.length; i += VENDORS_PER_ROW) {
      rows.push(vendors.slice(i, i + VENDORS_PER_ROW));
    }
    return rows;
  }, [vendors]);

  if (loading) {
    return (
      <div className="vendor-showcase-loading">
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="vendor-showcase-error">
        <Text type="danger">{error}</Text>
      </div>
    );
  }

  return (
    <div className="vendor-showcase">
      <div className="vendor-grid">
        {vendorRows.map((rowVendors, index) => (
          <VendorRow
            key={index}
            vendors={rowVendors}
            rowIndex={index}
          />
        ))}
      </div>
    </div>
  );
};

export default React.memo(VendorShowcase); 