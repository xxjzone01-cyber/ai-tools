import React, { useState, useEffect } from 'react';
import { Card, Button, List, Tag, Statistic, message, Modal } from 'antd';
import { 
  PlayCircleOutlined, 
  PauseCircleOutlined, 
  StopOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import type { TimeRecord } from '../services/timeTrackingService';
import timeTrackingService from '../services/timeTrackingService';
import type { ActiveTrackingResponse } from '../services/timeTrackingService';

const TimeTracker: React.FC = () => {
  const [isTracking, setIsTracking] = useState(false);
  const [activeRecord, setActiveRecord] = useState<TimeRecord | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [timeRecords, setTimeRecords] = useState<TimeRecord[]>([]);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<TimeRecord | null>(null);

  useEffect(() => {
    checkActiveTracking();
    loadTimeRecords();
    
    // 如果有活跃记录，启动计时器
    const interval = setInterval(() => {
      if (activeRecord) {
        const now = new Date();
        const start = new Date(activeRecord.startTime);
        const elapsed = Math.floor((now.getTime() - start.getTime()) / 1000 / 60);
        setElapsedTime(elapsed);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [activeRecord]);

  const checkActiveTracking = async () => {
    try {
      const response: ActiveTrackingResponse = await timeTrackingService.getActiveTimeTracking();
      setIsTracking(response.hasActiveTracking);
      setActiveRecord(response.activeRecord || null);
      
      if (response.activeRecord) {
        const now = new Date();
        const start = new Date(response.activeRecord.startTime);
        setElapsedTime(Math.floor((now.getTime() - start.getTime()) / 1000 / 60));
      }
    } catch (error: any) {
      console.error('检查活跃追踪失败:', error);
    }
  };

  const loadTimeRecords = async () => {
    try {
      const records = await timeTrackingService.getTimeRecords();
      setTimeRecords(records.slice(0, 10)); // 只显示最近10条
    } catch (error: any) {
      console.error('加载时间记录失败:', error);
      message.error('加载时间记录失败');
    }
  };

  const handleStart = async () => {
    try {
      const record = await timeTrackingService.startTimeTracking({});
      setIsTracking(true);
      setActiveRecord(record);
      setElapsedTime(0);
      message.success('时间追踪已开始');
      loadTimeRecords();
    } catch (error: any) {
      console.error('开始时间追踪失败:', error);
      message.error('开始时间追踪失败');
    }
  };

  const handleStop = async () => {
    if (!activeRecord) return;

    try {
      const stoppedRecord = await timeTrackingService.stopTimeTracking(activeRecord.id);
      setIsTracking(false);
      setActiveRecord(null);
      setElapsedTime(0);
      message.success('时间追踪已停止');
      loadTimeRecords();
    } catch (error: any) {
      console.error('停止时间追踪失败:', error);
      message.error('停止时间追踪失败');
    }
  };

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    
    if (hours > 0) {
      return `${hours}小时${mins > 0 ? `${mins}分钟` : ''}`;
    }
    return `${mins}分钟`;
  };

  const showDetails = (record: TimeRecord) => {
    setSelectedRecord(record);
    setDetailsVisible(true);
  };

  return (
    <div>
      <Card 
        title="时间追踪" 
        extra={
          <Button 
            onClick={loadTimeRecords} 
            icon={<ClockCircleOutlined />}
          >
            刷新
          </Button>
        }
      >
        {/* 当前时间追踪状态 */}
        <div style={{ 
          textAlign: 'center', 
          padding: '32px 0',
          background: '#fafafa',
          borderRadius: '8px',
          marginBottom: '24px'
        }}>
          <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#1890ff', marginBottom: '16px' }}>
            {formatTime(elapsedTime)}
          </div>
          
          <div style={{ marginBottom: '24px' }}>
            {isTracking ? (
              <Tag color="success" icon={<ClockCircleOutlined />}>
                进行中
              </Tag>
            ) : (
              <Tag icon={<PauseCircleOutlined />}>
                未开始
              </Tag>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
            {!isTracking ? (
              <Button 
                type="primary" 
                size="large" 
                icon={<PlayCircleOutlined />}
                onClick={handleStart}
              >
                开始计时
              </Button>
            ) : (
              <Button 
                danger 
                size="large" 
                icon={<StopOutlined />}
                onClick={handleStop}
              >
                停止计时
              </Button>
            )}
          </div>
        </div>

        {/* 时间记录列表 */}
        <div>
          <h3>最近时间记录</h3>
          <List
            dataSource={timeRecords}
            renderItem={(item) => (
              <List.Item
                actions={[
                  <Button type="link" onClick={() => showDetails(item)}>
                    查看详情
                  </Button>
                ]}
              >
                <List.Item.Meta
                  title={
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>
                        {item.task?.title || '通用时间记录'}
                      </span>
                      {item.category && (
                        <Tag color={item.category.color}>{item.category.name}</Tag>
                      )}
                    </div>
                  }
                  description={
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>
                        {formatDuration(item.duration)}
                      </span>
                      <span style={{ color: '#999' }}>
                        {new Date(item.startTime).toLocaleString()}
                      </span>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        </div>
      </Card>

      {/* 详情弹窗 */}
      <Modal
        title="时间记录详情"
        open={detailsVisible}
        onCancel={() => setDetailsVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailsVisible(false)}>
            关闭
          </Button>
        ]}
      >
        {selectedRecord && (
          <div>
            <Statistic
              title="时长"
              value={formatDuration(selectedRecord.duration)}
              valueStyle={{ color: '#1890ff', fontSize: '24px' }}
            />
            
            <div style={{ marginTop: '24px' }}>
              <p><strong>开始时间:</strong> {new Date(selectedRecord.startTime).toLocaleString()}</p>
              <p><strong>结束时间:</strong> {new Date(selectedRecord.endTime).toLocaleString()}</p>
              {selectedRecord.task && (
                <p><strong>关联任务:</strong> {selectedRecord.task.title}</p>
              )}
              {selectedRecord.category && (
                <p><strong>分类:</strong> <Tag color={selectedRecord.category.color}>{selectedRecord.category.name}</Tag></p>
              )}
              {selectedRecord.notes && (
                <p><strong>备注:</strong> {selectedRecord.notes}</p>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default TimeTracker;